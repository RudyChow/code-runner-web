<template>
  <codemirror
    :options="editorOption"
    v-model="value"
    ref="myCm"
    @ready="onCmReady"
    @input="onCmCodeChange"
  >
  </codemirror>
</template>

<script>
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/mbo.css'
// 括号匹配
import 'codemirror/addon/edit/matchbrackets.js'
// 关闭括号
import 'codemirror/addon/edit/closebrackets.js'
// 活跃行
import 'codemirror/addon/selection/active-line.js'
// 折叠代码
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
// 语言
import 'codemirror/mode/php/php.js'
import 'codemirror/mode/go/go.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/ruby/ruby.js'
import 'codemirror/mode/clike/clike.js'
// 代码提示
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/anyword-hint.js'

import editorLanguages from '../editor/language.js'

export default {
  components: {codemirror},
  props: {
    language: String,
    editorOption: Object,
    show: String
  },
  data () {
    return {
      value: null
    }
  },
  mounted () {
    this.value = this.show === null || this.show === undefined ? '' : this.show
    this.$refs.myCm.codemirror.setSize('auto', '500px')
  },
  methods: {
    // 编辑器初始化
    onCmReady (cm) {
      // 开启提示
      cm.on('keypress', () => {
        cm.showHint({completeSingle: false})
      })
    },
    // 编辑器内容改变
    onCmCodeChange (newCode) {
      this.$emit('update:code', newCode)
      this.$emit('update:ws:code', newCode)
      this.$emit('push:code')
    }
  },
  watch: {
    // 语言变化
    language: function () {
      this.editorOption.mode = editorLanguages[this.language].mode
      this.value = editorLanguages[this.language].template
    },
    // 显示内容
    show: function (val) {
      this.value = val
    }
  }
}
</script>
