import { extname } from 'path'
import { FileType, PresetAccess } from '@prisma/client'
import { getDocumentType, isImage } from '@/lib'
import { UseCaseParams } from '@/domain/usecase/types'
import { IPreset } from '@/domain/entity/preset'
import { ForbiddenError } from '@/domain/errors'
import { File } from './types'
import { IFile } from '@/domain/entity/file'

export type Create = (params: {
  userId: string
  name: string
  description: string
  modelId: string | null
  systemPrompt: string
  files: File[]
  access: PresetAccess
  categoriesIds: string[]
}) => Promise<IPreset | never>

export const buildCreate =
  ({ adapter, service }: UseCaseParams): Create =>
  async ({ userId, name, description, modelId, systemPrompt, files, access, categoriesIds }) => {
    const images = files.filter((file) => isImage(file.originalname))

    if (images.length > 0) {
      throw new ForbiddenError({
        code: 'IMAGES_NOT_SUPPORTED',
      })
    }

    const documents = files.filter((file) => !isImage(file.originalname))

    const markdownDocs = await Promise.all(
      documents.map((document) =>
        adapter.documentGateway.toMarkdown({
          buffer: document.buffer,
          type: getDocumentType(document.originalname),
        }),
      ),
    )
    const moderatedDocuments = await Promise.all(
      markdownDocs.map((markdownDoc) => adapter.moderationGateway.moderate(markdownDoc)),
    )

    if (access === PresetAccess.PUBLIC) {
      await service.moderation.moderate({
        userId: userId,
        content: name,
        contentCategory: 'presetName',
      })

      await service.moderation.moderate({
        userId: userId,
        content: description,
        contentCategory: 'presetDescription',
      })

      await service.moderation.moderate({
        userId: userId,
        content: systemPrompt,
        contentCategory: 'presetSystemPrompt',
      })

      if (moderatedDocuments.some((document) => document.flagged)) {
        throw new ForbiddenError({
          code: 'FILES_VIOLATION',
        })
      }
    }

    const storedDocuments = await Promise.all(
      documents.map((document) =>
        adapter.storageGateway.write({
          buffer: document.buffer,
          ext: extname(document.originalname),
        }),
      ),
    )

    const dbDocuments = (await Promise.all(
      storedDocuments.map(async (document, index) =>
        adapter.fileRepository.create({
          data: {
            type: FileType.DOCUMENT,
            name: documents[index].originalname,
            size: documents[index].size,
            url: document.url,
            path: document.path,
          },
        }),
      ),
    ).then((docs) => docs.filter((doc) => !!doc))) as IFile[]

    const presetAttachments = dbDocuments.map((document, index) => ({
      file_id: document.id,
      is_nsfw: moderatedDocuments[index].flagged,
    }))

    const preset = await adapter.presetRepository.create({
      data: {
        name,
        description,
        model_id: modelId,
        system_prompt: systemPrompt,
        attachments: {
          createMany: {
            data: presetAttachments,
          },
        },
        access,
        author_id: userId,
        categories: {
          connect: categoriesIds.map((categoryId) => ({
            id: categoryId,
          })),
        },
        users: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        attachments: {
          include: {
            file: true,
          },
        },
        categories: true,
      },
    })

    preset.favorite = true

    return preset
  }
