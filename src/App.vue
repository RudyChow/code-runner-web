<template>
  <div id="app">
    <Layout>
      <Header>
        <Menu
          mode="horizontal"
          theme="dark"
        >
          <div class="layout-logo">
            <Icon
              type="md-code-working"
              size="60"
              color="#fff"
            />
          </div>
          <div class="layout-nav">
            <Tooltip max-width="200">
              <Button
                type="text"
                ghost
              >TODO</Button>
              <div slot="content">
                <p>1.短链接分享</p>
                <p>2.协助编程</p>
              </div>
            </Tooltip>
          </div>
        </Menu>
      </Header>
      <Content :style="{padding: '10px 20px'}">

        <Row>
          <Col
            span="12"
            :style="{padding: '20px 20px'}"
          >
          <Row :style="{height: '60px'}">

            <Cascader
              :data="languageVersions"
              v-model="selectdValue"
              style="width:150px"
              placeholder="choose your env"
            ></Cascader>

          </Row>
          <!-- 编辑器 -->

          <codemirror
            :show="codeMirrorShow"
            :language="selectedLanguage"
            :editorOption="codeMirrorOptions"
            v-model="code"
            v-on:update:code="code=$event"
          ></codemirror>
          </Col>

          <Col
            span="12"
            :style="{padding: '20px 20px'}"
          >
          <Row :style="{height: '60px'}">

            <Button
              type="primary"
              icon="ios-play"
              :loading="submitLoading"
              @click='submitCode'
            >
              <span>Run!</span>
            </Button>
            <Tooltip
              content="//TODO:YOU WILL GET A SHORT URL TO SHARE"
              max-width="200"
            >
              <Button
                type="success"
                icon="ios-share"
              >Share</Button>
            </Tooltip>

          </Row>
          <!-- 代码结果 -->
          <div style="background:#eee">
            <Card :bordered="false">
              <p slot="title">Console</p>
              <Input
                v-model="result"
                type="textarea"
                :rows="10"
                placeholder="Stdout..."
              />
            </Card>
          </div>
          </Col>
        </Row>
      </Content>

      <Footer class="layout-footer-center">2019-2019 &copy; CodeRunner</Footer>
    </Layout>
  </div>
</template>

<script>

import axios from 'axios'
import codemirror from './components/CodeMirror'

export default {
  name: 'App',
  components: {
    codemirror
  },
  data () {
    return {
      selectdValue: [],
      languageVersions: [],
      selectedLanguage: '',
      selectedVersion: '',
      code: '',
      result: '',
      submitLoading: false,
      // 编辑器初始化的值
      codeMirrorShow: `//1. select language
//2. select version
//3. input your code`,
      codeMirrorOptions: {
        mode: '',
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        theme: 'mbo',
        matchBrackets: true,
        autoCloseBrackets: true,
        // 代码折叠
        lineWrapping: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']

      }
    }
  },
  mounted () {
    // 获取支持的语言和版本
    axios
      .get('/api/v1/versions')
      .then((response) => {
        console.log(response)
        if (response.status !== 200) {
          this.$Message.error('获取运行环境失败')
          return
        }
        if (response.data.error !== '') {
          this.$Message.error('获取运行环境失败:' + response.data.error)
          return
        }

        this.handleEnvData(response.data.data)
      })
      .catch(function (error) { // 请求失败处理
        this.$Message.error('获取运行环境失败' + error)
      })
  },
  methods: {
    // 提交代码
    submitCode: function () {
      if (this.selectedLanguage === '' || this.selectedVersion === '') {
        this.$Message.error('请选择你要执行的语言和版本')
        return
      }
      if (this.code === '') {
        this.$Message.error('请填写你要执行的代码')
        return
      }
      // 发起请求
      this.result = 'Running...'
      this.submitLoading = true
      axios
        .post('/api/v1/code', {
          'name': this.selectedLanguage,
          'version': this.selectedVersion,
          'code': this.code
        })
        .then((response) => {
          this.result = response.data.error !== '' ? response.data.error : response.data.data.code_result
          this.submitLoading = false
        })
        .catch(function (error) { // 请求失败处理
          this.$Message.error('oops,something went wrong')
          console.log('获取执行结果失败')
          console.log(error)
          this.submitLoading = false
        })
    },
    // 数据转换
    handleEnvData: function (data) {
      this.languageVersions = []
      for (let language in data) {
        let father = {
          value: language,
          label: language,
          children: []
        }

        for (let version in data[language]) {
          father.children.push({
            value: data[language][version],
            label: data[language][version]
          })
        }

        this.languageVersions.push(father)
      }
    }
  },
  watch: {
    // 级连变化
    selectdValue (params) {
      if (params.length === 0) {
        this.selectedLanguage = this.selectedVersion = ''
        return
      }

      for (let index = 0; index < params.length; index++) {
        if (index === 0) {
          this.selectedLanguage = params[index]
        }
        if (index === 1) {
          this.selectedVersion = params[index]
        }
      }
    }
  }
}
</script>

<style scoped>
.layout {
  border: 1px solid #d7dde4;
  background: #f5f7f9;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}
.layout-logo {
  width: 100px;
  height: 30px;
  /* background: #5b6270; */
  /* border-radius: 3px; */
  float: left;
  position: relative;
  /* top: 15px; */
  /* left: 20px; */
}
.layout-nav {
  width: 100px;
  margin: 0 auto;
  margin-right: 20px;
}
.layout-footer-center {
  text-align: center;
}
</style>
