// Styles
import './VList.sass'

// Components
import { VListChildren } from './VListChildren'

// Composables
import { createList } from './list'
import { makeBorderProps, useBorder } from '@/composables/border'
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { makeItemsProps, useItems } from '@/composables/items'
import { makeNestedProps, useNested } from '@/composables/nested/nested'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { makeVariantProps } from '@/composables/variant'
import { provideDefaults } from '@/composables/defaults'
import { useBackgroundColor } from '@/composables/color'

// Utilities
import { computed, toRef } from 'vue'
import { genericComponent, useRender } from '@/util'

// Types
import type { PropType } from 'vue'
import type { MakeSlots } from '@/util'
import type { InternalItem } from '@/composables/items'
import type { ListGroupActivatorSlot } from './VListGroup'
import type { ListItemSlot } from './VListChildren'
import type { ListItemSubtitleSlot, ListItemTitleSlot } from './VListItem'

export interface InternalListItem<T> extends InternalItem<T> {
  type?: 'item' | 'subheader' | 'divider'
}

export const VList = genericComponent<new <T>() => {
  $props: {
    items?: readonly T[]
  }
  $slots: MakeSlots<{
    'no-data': [{ noDataText: string }]
    subheader: [{ props: Record<string, unknown> }]
    divider: [{ props: Record<string, unknown> }]
    header: [ListGroupActivatorSlot]
    item: [ListItemSlot<T>]
    title: [ListItemTitleSlot]
    subtitle: [ListItemSubtitleSlot]
  }>
}>()({
  name: 'VList',

  props: {
    activeColor: String,
    activeClass: String,
    bgColor: String,
    disabled: Boolean,
    lines: {
      type: [Boolean, String] as PropType<'one' | 'two' | 'three' | false>,
      default: 'one',
    },
    nav: Boolean,
    noDataText: {
      type: String,
      default: '$vuetify.noDataText',
    },
    hideNoData: Boolean,

    ...makeNestedProps({
      selectStrategy: 'single-leaf' as const,
      openStrategy: 'list' as const,
    }),
    ...makeBorderProps(),
    ...makeDensityProps(),
    ...makeDimensionProps(),
    ...makeElevationProps(),
    ...makeItemsProps(),
    ...makeRoundedProps(),
    ...makeTagProps(),
    ...makeThemeProps(),
    ...makeVariantProps({ variant: 'text' } as const),
  },

  emits: {
    'update:selected': (val: string[]) => true,
    'update:opened': (val: string[]) => true,
    'click:open': (value: { id: string, value: boolean, path: string[] }) => true,
    'click:select': (value: { id: string, value: boolean, path: string[] }) => true,
  },

  setup (props, { slots }) {
    const { items } = useItems(props)
    const { themeClasses } = provideTheme(props)
    const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(toRef(props, 'bgColor'))
    const { borderClasses } = useBorder(props)
    const { densityClasses } = useDensity(props)
    const { dimensionStyles } = useDimension(props)
    const { elevationClasses } = useElevation(props)
    const { roundedClasses } = useRounded(props)
    const { open, select } = useNested(props)
    const lineClasses = computed(() => props.lines ? `v-list--${props.lines}-line` : undefined)
    const activeColor = toRef(props, 'activeColor')
    const color = toRef(props, 'color')

    createList()

    provideDefaults({
      VListGroup: {
        activeColor,
        color,
      },
      VListItem: {
        activeClass: toRef(props, 'activeClass'),
        activeColor,
        color,
        density: toRef(props, 'density'),
        disabled: toRef(props, 'disabled'),
        lines: toRef(props, 'lines'),
        nav: toRef(props, 'nav'),
        variant: toRef(props, 'variant'),
      },
    })

    useRender(() => (
      <props.tag
        class={[
          'v-list',
          {
            'v-list--disabled': props.disabled,
            'v-list--nav': props.nav,
          },
          themeClasses.value,
          backgroundColorClasses.value,
          borderClasses.value,
          densityClasses.value,
          elevationClasses.value,
          lineClasses.value,
          roundedClasses.value,
        ]}
        style={[
          backgroundColorStyles.value,
          dimensionStyles.value,
        ]}
      >
        <VListChildren
          items={ items.value }
          noDataText={ !props.hideNoData ? props.noDataText : undefined }
          v-slots={ slots }
        ></VListChildren>
      </props.tag>
    ))

    return {
      open,
      select,
    }
  },
})

export type VList = InstanceType<typeof VList>
