import { defineComponent, h } from 'vue'

function withClass(attrs: Record<string, unknown>, className: string) {
  const { class: existingClass, ...rest } = attrs
  return { ...rest, class: [className, existingClass] }
}

export const UHeader = defineComponent({
  name: 'UHeader',
  props: { title: { type: String, default: '' } },
  setup(props, { slots }) {
    return () =>
      h('header', { class: 'uheader' }, [
        h('span', { class: 'uheader-title' }, props.title),
        slots.right ? h('div', { class: 'uheader-right' }, slots.right()) : null,
      ])
  },
})

export const UIcon = defineComponent({
  name: 'UIcon',
  props: { name: { type: String, default: '' } },
  setup(props) {
    return () => h('i', { class: ['uicon', props.name] })
  },
})

export const UButton = defineComponent({
  name: 'UButton',
  inheritAttrs: false,
  props: {
    to: { type: String, default: '' },
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const children = props.label || slots.default?.()
      if (props.to) {
        return h('a', withClass({ href: props.to, 'data-to': props.to, ...attrs }, 'ubutton'), children)
      }
      return h('button', withClass({ type: 'button', ...attrs }, 'ubutton'), children)
    }
  },
})

export const UBadge = defineComponent({
  name: 'UBadge',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('span', withClass(attrs, 'ubadge'), slots.default?.())
  },
})

export const UAlert = defineComponent({
  name: 'UAlert',
  inheritAttrs: false,
  props: {
    title: { type: String, default: '' },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h('div', withClass(attrs, 'ualert'), [
        props.title ? h('div', { class: 'ualert-title' }, props.title) : null,
        slots.default?.(),
        slots.description ? h('div', { class: 'ualert-description' }, slots.description()) : null,
      ])
  },
})

export const UCard = defineComponent({
  name: 'UCard',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () =>
      h('section', withClass(attrs, 'ucard'), [
        slots.header ? h('div', { class: 'ucard-header' }, slots.header()) : null,
        slots.default?.(),
        slots.footer ? h('div', { class: 'ucard-footer' }, slots.footer()) : null,
      ])
  },
})

export const UContainer = defineComponent({
  name: 'UContainer',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('div', withClass(attrs, 'ucontainer'), slots.default?.())
  },
})

export const UInput = defineComponent({
  name: 'UInput',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number], default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    return () =>
      h('input', {
        ...withClass(attrs, 'uinput'),
        value: props.modelValue,
        onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value),
      })
  },
})
