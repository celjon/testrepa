import { IChat } from '@/domain/entity/chat'
import { IChatMidjourneySettings, IChatSettingsElement } from '@/domain/entity/chat-settings'
import { MidjourneyMode } from '@prisma/client'

export type CreateElements = (params: {
  chat: IChat
  settings: IChatMidjourneySettings
}) => IChatSettingsElement[]

export const buildCreateElements =
  (): CreateElements =>
  ({ settings }) => {
    return [
      {
        id: 'mj_version',
        code: 'mj_version',
        name: 'version',
        type: 'string',
        field_type: 'select',
        reload_on_update: true,
        value: settings.version,
        data: [
          {
            id: '7',
            code: 'mj_version_7',
            value: '7',
          },
          {
            id: '6.1',
            code: 'mj_version_6',
            value: '6.1',
          },
          {
            id: '6.0',
            code: 'mj_version_6',
            value: '6.0',
          },
          {
            id: '5.2',
            code: 'mj_version_5_2',
            value: '5.2',
          },
        ],
      },
      {
        id: 'mj_mode',
        code: 'mj_mode',
        name: 'mode',
        type: 'string',
        field_type: 'select',
        value:
          settings.version === '7' && settings.mode !== MidjourneyMode.RELAX
            ? MidjourneyMode.TURBO
            : settings.mode === MidjourneyMode.TURBO &&
                settings.version !== '5.2' &&
                settings.version !== '7'
              ? MidjourneyMode.FAST
              : settings.mode,
        data: [
          {
            id: 'relax',
            code: 'mj_mode_relax',
            value: MidjourneyMode.RELAX,
          },
          {
            id: 'fast',
            code: 'mj_mode_fast',
            disabled: settings.version === '7',
            value: MidjourneyMode.FAST,
          },
          {
            id: 'turbo',
            code: 'mj_mode_turbo',
            disabled: settings.version !== '5.2' && settings.version !== '7',
            value: MidjourneyMode.TURBO,
          },
        ],
      },
      {
        id: 'mj_aspect',
        code: 'mj_aspect',
        name: 'aspect',
        type: 'string',
        field_type: 'select',
        value: settings.aspect,
        data: [
          {
            id: '1:1',
            code: 'mj_aspect_1_1',
            value: '1:1',
          },
          {
            id: '2:3',
            code: 'mj_aspect_2_3',
            value: '2:3',
          },
          {
            id: '3:2',
            code: 'mj_aspect_3_2',
            value: '3:2',
          },
          {
            id: '4:5',
            code: 'mj_aspect_4_5',
            value: '4:5',
          },
          {
            id: '4:7',
            code: 'mj_aspect_4_7',
            value: '4:7',
          },
          {
            id: '5:4',
            code: 'mj_aspect_5_4',
            value: '5:4',
          },
          {
            id: '7:4',
            code: 'mj_aspect_7_4',
            value: '7:4',
          },
        ],
      },
      {
        id: 'mj_chaos',
        code: 'mj_chaos',
        name: 'chaos',
        type: 'float',
        field_type: 'range',
        step: 1,
        min: 0,
        max: 100,
        value: settings.chaos,
      },
      {
        id: 'mj_quality',
        code: 'mj_quality',
        name: 'quality',
        type: 'float',
        field_type: 'range',
        step: 0.25,
        min: 0.25,
        max: 1,
        value: settings.quality,
      },
      {
        id: 'mj_style',
        code: 'mj_style',
        name: 'style',
        type: 'string',
        field_type: 'select',
        value: settings.style ?? 'default',
        data: [
          {
            id: 'default',
            code: 'mj_style_default',
            value: 'default',
          },
          {
            id: 'raw',
            code: 'mj_style_raw',
            value: 'raw',
          },
        ],
      },
      {
        id: 'mj_stylize',
        code: 'mj_stylize',
        name: 'stylize',
        type: 'float',
        field_type: 'range',
        step: 50,
        min: 0,
        max: 1000,
        value: settings.stylize,
      },
      {
        id: 'mj_tile',
        code: 'mj_tile',
        name: 'tile',
        type: 'boolean',
        field_type: 'checkbox',
        checked: settings.tile,
      },
      {
        id: 'mj_weird',
        code: 'mj_weird',
        name: 'weird',
        type: 'float',
        field_type: 'range',
        step: 250,
        min: 0,
        max: 3000,
        value: settings.weird,
      },
      {
        id: 'mj_stop',
        code: 'mj_stop',
        name: 'stop',
        type: 'float',
        field_type: 'range',
        step: 1,
        min: 10,
        max: 100,
        value: settings.stop,
      },
      {
        id: 'mj_no',
        code: 'mj_no',
        name: 'no',
        type: 'string',
        field_type: 'text',
        value: settings.no,
      },
    ]
  }
