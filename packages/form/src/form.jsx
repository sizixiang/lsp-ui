
import { toRefs, computed, provide, ref } from 'vue'
import { isSymbol, generatingRandom } from '../../utils/lib'

export default {
  name: 'AimerForm',
  props: {
    class: {
      type: String,
      default: ''
    },
    // major key
    id: {
      type: String,
      default: ''
    },
    labelWidth: [String, Number],
    data: {
      type: Array,
      default: () => [
        {
          type: 'text',
          prop: 'a1',
          label: 'a1',
          readonly: true,
          size: 'mini'
        },
        {
          type: 'password',
          prop: 's2',
          label: 'a2',
          showPassword: true,
          size: 'medium'
        },
        {
          prop: 's3',
          label: 'a3',
          disabled: true,
          prefixIcon: 'login',
          size: 'giant'
        },
        {
          prop: 's4',
          label: 'a4',
          disabled: true,
          prefixIcon: 'login',
          size: 'small'
        }
      ],
    },
    model: {
      type: Object,
      default:() => ({})
    }
  },
  setup(prop, { slots, emit }) {
    console.log('emit: ', emit);
    const id = ref(prop.id)
    const className = ref(prop.className)
    const attribute = computed(() => {
      const { labelWidth } = toRefs(prop)
      return { labelWidth: labelWidth.value || '' }
    })

    const template = computed(() => {
      const { data } = toRefs(prop)
      let template = null
      // Detection slots is empty
      // If slots is empty, Use array As a template
      // If slots and data is all not empty, Will take slots and data common use as a template

      // 检测插槽是否为空
      // 如果插槽为空，则使用array作为模板
      // 如果插槽和data都不为空，将以插槽和data为常用模板
      if ((slots && slots.default) && data.value.length) {
        template = bothTemplate(slots.default(), data.value)
      } else if(slots.default) {
        template = slots.default()
      } else if (data.value.length) {
        //  1111
      }
      return template
    })
    provide('aimerFormAttr', attribute.value)
    return() => (
      <div key={`${id.value}From`} class={`aimer-form ${className.value}`}>
        {template.value}
      </div>
    )
  }
}

// If both exist, As a data first render
// Each data, If slot there are params.linkLabel, This slot is inserted after the data loop
const bothTemplate = (vNode, data) => {
  let template = []
  let vNodeLen = vNode.length
  let dataLen = data.length
  // Preventing annotations is also considered a combination of the two, by determining whether Symbol is commented or not
  // find slots params.linkLabel
  const hashMap = {}
  // Unordered slots
  const disorderly = []
  for (let i = 0; i < vNodeLen; i++) {
    if (!isSymbol(vNode[i].type)) {
      const label = vNode[i].props.linkLabel
      if (label) {
        hashMap[label] = vNode[i]
      } else {
        disorderly.push(vNode[i])
      }
    }
  }

  for (let i = 0;i < dataLen ; i++) {
    const { label, col, ...props } = data[i]
    if (hashMap[label]) {
      template.push( createElement({ label, key: generatingRandom()[0], col, ...props, }) )
      // Prevent too many props to be set
      delete hashMap[label].props.linkLabel
      hashMap[label].key = `form-item-${generatingRandom()[0]}`
      template.push(hashMap[label])
    } else {
      template.push( createElement({ label, key: generatingRandom()[0], col, ...props}) )
    }
  }
  template = [...template, ...disorderly]
  return ( template )
}

const createElement = ({col, key, label, ...props}) => {
  return (
    <aimer-col col={col || '24'} key={`form-item-${key}`}>
      <aimer-form-item {...props} label={label}>
        { createInput(props.type || 'text')(props) }
      </aimer-form-item>
    </aimer-col>
  )
}

const createInput = (type) => {
  const inputType = {
    text: function(props) {
      return (<aimer-input type={props.type || 'text'} {...props}/>)
    },
    password: function(props) {
      return (<aimer-input type={props.type} {...props}/>)
    },
    dellProps: function(props) {
      return inputType[type](props)
    }
  }
  return (props) => inputType.dellProps(props)
}
