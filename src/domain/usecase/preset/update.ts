import { extname } from 'path'
import { FileType, PresetAccess } from '@prisma/client'
import { getDocumentType, isImage } from '@/lib'
import { UseCaseParams } from '@/domain/usecase/types'
import { IPreset } from '@/domain/entity/preset'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { IPresetAttachment } from '@/domain/entity/presetAttachment'
import { File } from './types'
import { IFile } from '@/domain/entity/file'

export type Update = (params: {
  id: string
  userId: string
  name?: string
  description?: string
  modelId?: string | null
  systemPrompt?: string
  files?: File[]
  attachmentsIds?: string[]
  access?: PresetAccess
  categoriesIds?: string[]
}) => Promise<IPreset | never>

export const buildUpdate =
  ({ adapter, service }: UseCaseParams): Update =>
  async ({ id, userId, name, description, modelId, systemPrompt, files = [], attachmentsIds = [], access, categoriesIds }) => {
    let preset = await adapter.presetRepository.get({
      where: { id },
      include: {
        attachments: {
          include: {
            file: true
          }
        },
        categories: true
      }
    })

    if (!preset || !preset.categories) {
      throw new NotFoundError({
        code: 'PRESET_NOT_FOUND'
      })
    }

    const images = files.filter((file) => isImage(file.originalname))

    if (images.length > 0) {
      throw new ForbiddenError({
        code: 'IMAGES_NOT_SUPPORTED'
      })
    }

    const documents = files.filter((file) => !isImage(file.originalname))

    const markdownDocs = await Promise.all(
      documents.map((document) =>
        adapter.documentGateway.toMarkdown({
          buffer: document.buffer,
          type: getDocumentType(document.originalname)
        })
      )
    )
    const moderatedDocuments = await Promise.all(markdownDocs.map((markdownDoc) => adapter.moderationGateway.moderate(markdownDoc)))

    const { attachmentsToDelete, attachmentsToPreserve } = getAttachmentsDiff(preset.attachments || [], attachmentsIds)

    if ((!access && preset.access === PresetAccess.PUBLIC) || access === PresetAccess.PUBLIC) {
      if (name) {
        await service.moderation.moderate({
          userId: userId,
          content: name,
          contentCategory: 'presetName'
        })
      }

      if (description) {
        await service.moderation.moderate({
          userId: userId,
          content: description,
          contentCategory: 'presetDescription'
        })
      }

      if (systemPrompt) {
        await service.moderation.moderate({
          userId: userId,
          content: systemPrompt,
          contentCategory: 'presetSystemPrompt'
        })
      }

      if (attachmentsToPreserve.some((attachment) => attachment.is_nsfw)) {
        throw new ForbiddenError({
          code: 'FILES_VIOLATION'
        })
      }

      if (moderatedDocuments.some((document) => document.flagged)) {
        throw new ForbiddenError({
          code: 'FILES_VIOLATION'
        })
      }
    }

    const storedDocuments = await Promise.all(
      documents.map((document) =>
        adapter.storageGateway.write({
          buffer: document.buffer,
          ext: extname(document.originalname)
        })
      )
    )

    const dbDocuments = (await Promise.all(
      storedDocuments.map(async (document, index) =>
        adapter.fileRepository.create({
          data: {
            type: FileType.DOCUMENT,
            name: documents[index].originalname,
            size: documents[index].size,
            url: document.url,
            path: document.path
          }
        })
      )
    ).then((docs) => docs.filter((doc) => !!doc))) as IFile[]

    const presetAttachments = dbDocuments.map((document, index) => ({
      file_id: document.id,
      is_nsfw: moderatedDocuments[index].flagged
    }))

    if (preset.categories.length > 0 && categoriesIds) {
      await adapter.presetRepository.update({
        where: {
          id
        },
        data: {
          categories: {
            disconnect: preset.categories.map((category) => ({
              id: category.id
            }))
          }
        }
      })
    }

    // delete files if they are used only in preset attachments
    await Promise.all(
      attachmentsToDelete.map(
        async (attachment) =>
          adapter.fileRepository
            .delete({
              where: {
                id: attachment.file_id
              }
            })
            .catch(() => {}) // ignore integrity constraint errors
      )
    )

    preset = await adapter.presetRepository.update({
      where: {
        id,
        author_id: userId
      },
      data: {
        name,
        description,
        model_id: modelId ?? null,
        system_prompt: systemPrompt,
        attachments: {
          createMany: {
            data: presetAttachments
          },
          deleteMany: attachmentsToDelete.map((attachment) => ({
            id: attachment.id
          }))
        },
        access,
        ...(categoriesIds &&
          categoriesIds.length > 0 && {
            categories: {
              connect: categoriesIds.map((categoryId) => ({
                id: categoryId
              }))
            }
          })
      },
      include: {
        attachments: {
          include: {
            file: true
          }
        },
        categories: true
      }
    })

    if (!preset) {
      throw new NotFoundError({
        code: 'PRESET_NOT_FOUND'
      })
    }

    return preset
  }

const getAttachmentsDiff = (existingAttachments: IPresetAttachment[], attachmentsIds: string[]) => {
  const attachmentsToDelete: IPresetAttachment[] = []
  const attachmentsToPreserve: IPresetAttachment[] = []

  existingAttachments.forEach((existingAttachment) => {
    if (!attachmentsIds.includes(existingAttachment.id)) {
      attachmentsToDelete.push(existingAttachment)
    } else {
      attachmentsToPreserve.push(existingAttachment)
    }
  })

  return {
    attachmentsToDelete,
    attachmentsToPreserve
  }
}
