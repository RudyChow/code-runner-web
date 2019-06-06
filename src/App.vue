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
                <p><del>1.短链接分享</del></p>
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
              placeholder="Language/Version"
              trigger="hover"
              filterable
            ></Cascader>

          </Row>
          <!-- 编辑器 -->

          <codemirror
            :show="codeMirrorShow"
            :language="selectedLanguage"
            :editorOption="codeMirrorOptions"
            v-model="code"
            v-on:update:code="code=$event"
            v-on:update:ws:code="wsCode=$event"
            v-on:push:code="pushCode"
          ></codemirror>
          </Col>

          <Col
            span="12"
            :style="{padding: '20px 20px'}"
          >
          <Row :style="{height: '60px'}">

            <Button
              type="primary"
              icon="md-play"
              :loading="submitLoading"
              @click='submitCode'
            >Run!
            </Button>

            <Button
              type="info"
              icon="md-contacts"
              :loading="inviteLoading"
              @click='invite'
            >Invite
            </Button>

              <Button
                type="success"
                icon="ios-share"
                :loading="share.loading"
                @click="shareSnippet"
              >Share</Button>
            <Tooltip content="点击icon复制" :always='share.tips' :disabled='!share.tips' placement="right" theme="dark">
            <Input
              icon="md-document"
              style="width: 250px"
              v-model="share.url"
              @on-click="copyShareUrl"
            />
            </Tooltip>

          </Row>
          <!-- 代码结果 -->
          <Card :bordered="false">
            <p slot="title">Console</p>
            <Input
              v-model="result"
              type="textarea"
              :rows="11"
              :disabled="submitLoading"
              placeholder="Stdout..."
            />
          </Card>
          <Divider orientation="left">Read me</Divider>

          <Card>
            <p>1.目前做了CPU、内存、进程数和执行结果长度限制，但暂时不进行网络限制，所以可以在代码中发起网络请求，如果遇到恶意代码，则会进行网络限制。</p>
            <p>2.后续会支持更多的语言和版本<del>，如果我有钱买更好的服务器</del>。</p>
            <p>3.有问题、建议和Bug可以
              <Tooltip content="https://github.com/RudyChow">
                <a
                  href="https://github.com/RudyChow"
                  target="_blank"
                >
                  <Icon type="logo-github" />
                </a>
              </Tooltip>
              或者
              <Tooltip content="454106101@163.com">
                <a href="mailto: 454106101@163.com">
                  <Icon type="md-mail" />。
                </a>
              </Tooltip>
            </p>
          </Card>
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
      // 被选中的及联语言和版本
      selectdValue: [],
      // 语言和版本的及联下拉框
      languageVersions: [],
      // 被选中的语言
      selectedLanguage: '',
      // 被选中的版本
      selectedVersion: '',
      // 代码
      code: '',
      wsCode: '',
      // 运行结果
      result: '',
      // 按钮的loading
      submitLoading: false,
      inviteLoading: false,
      // 分享相关
      share: {
        loading: false,
        url: '',
        tips: false
      },
      // 编辑器显示的内容
      codeMirrorShow: `//1. select language and version
//2. input your code in here`,
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
      },
      // websocket相关
      ws: {
        websock: null,
        username: '',
        room: '',
        online: 0
      }

    }
  },
  mounted () {
    // 获取支持的语言和版本
    this.getVersions()
    // 获取代码片段
    this.getSnippet()
    // 获取房间
    this.initRoom()
  },
  methods: {
    // 获取语言和版本
    getVersions: function () {
      axios
        .get('/api/code/versions')
        .then((response) => {
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
        .catch((error) => { // 请求失败处理
          this.$Message.error('获取运行环境失败:' + error)
        })
    },
    // 获取代码片段
    getSnippet: function () {
      let path = window.location.pathname
      let paths = path.split('/')
      if (paths.length === 3 && paths[1] === 's') {
        axios
          .get('/api/snippet/' + paths[2])
          .then((response) => {
            if (response.status !== 200) {
              this.$Message.error('获取代码段失败')
              return
            }
            if (response.data.error !== '') {
              this.$Message.error('获取代码段失败:代码不存在或已过期')
            }
            this.selectdValue = [response.data.data.language, response.data.data.version]
            this.codeMirrorShow = response.data.data.code
            this.share.url = window.location.href
            this.$Message.success('获取代码成功')
          })
          .catch((error) => { // 请求失败处理
            console.log(error)
            this.$Message.error('获取代码段失败:' + error)
          })
      }
    },
    // 提交代码
    submitCode: function () {
      if (!this.validateSubmit()) return
      // 发起请求
      this.result = 'Running...'
      this.submitLoading = true
      axios
        .post('/api/code', {
          'language': this.selectedLanguage,
          'version': this.selectedVersion,
          'code': this.code
        })
        .then((response) => {
          this.submitLoading = false
          this.result = response.data.error !== '' ? response.data.error : response.data.data.code_result
        })
        .catch((error) => { // 请求失败处理
          this.submitLoading = false
          this.result = ''
          this.$Message.error('oops,something went wrong')
          console.log('获取执行结果失败:' + error)
        })
    },
    // 分享代码片段
    shareSnippet: function () {
      if (!this.validateSubmit()) return
      // 发起请求
      this.share.loading = true
      axios
        .post('/api/snippet', {
          'language': this.selectedLanguage,
          'version': this.selectedVersion,
          'code': this.code
        })
        .then((response) => {
          this.share.loading = false
          if (response.data.error !== '') this.$Message.error('分享失败：' + response.data.error)
          this.share.tips = true
          this.share.url = window.location.origin + '/s/' + response.data.data
        })
        .catch((error) => { // 请求失败处理
          this.share.loading = false
          this.$Message.error('oops,something went wrong')
          console.log('分享失败:' + error)
        })
    },
    // 复制分享链接
    copyShareUrl: function () {
      this.$copyText(this.share.url).then((e) => {
        this.$Message.success('复制成功')
        this.share.tips = false
      }, (e) => {
        this.$Message.error('复制失败')
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
    },
    // 提交必填
    validateSubmit: function () {
      if (this.selectedLanguage === '' || this.selectedVersion === '') {
        this.$Message.error('请选择你要执行的语言和版本')
        return false
      }
      if (this.code === '') {
        this.$Message.error('请填写你要执行的代码')
        return false
      }
      return true
    },
    // 根据path判断是否自动进入房间
    initRoom: function () {
      let path = window.location.pathname
      let paths = path.split('/')
      if (paths.length === 3 && paths[1] === 'w') {
        this.ws.room = paths[2]
      }

      if (this.ws.room !== '') {
        this.initWebsocket()
      }
    },
    // 邀请
    invite: function () {
      if (this.ws.websock != null) {
        this.$Message.info('你目前已在房间中')
        return
      }
      this.initWebsocket()
    },
    // 创建websocket连接
    initWebsocket: function () {
      const wsuri = `ws://192.168.1.109:27000/ws` + (this.ws.room ? ('/' + this.ws.room) : '')// 这个地址由后端童鞋提供
      this.ws.websock = new WebSocket(wsuri)
      this.ws.websock.onmessage = this.websocketonmessage
      this.ws.websock.onopen = this.websocketonopen
      this.ws.websock.onerror = this.websocketonerror
      this.ws.websock.onclose = this.websocketclose
    },
    websocketonopen () { // 连接建立之后执行send方法发送数据
      console.log('open')
    },
    websocketonerror () { // 连接建立失败重连
    },
    websocketonmessage (e) {
      let data = JSON.parse(e.data)
      console.log(data)
      switch (data.type) {
        // 个人信息
        case 'info':
          this.ws.username = data.data.username
          this.ws.room_id = data.data.room_id
          this.share.tips = true
          this.share.url = window.location.origin + '/w/' + data.data.room_id

          break
        // 房间信息
        case 'room':
          // 人数判断
          let online = Object.keys(data.data.clients).length
          if (this.ws.online !== online) {
            this.$Notice.info({
              title: '房间人数：' + online,
              duration: 10
            })
          }
          this.ws.online = online

          // 同步代码
          if (this.ws.username !== data.data.last_mod_user) {
            if (data.data.language !== '' && data.data.version !== '') {
              this.selectdValue = [data.data.language, data.data.version]
              this.codeMirrorShow = data.data.code
            }
          }
          break
        // 消息推送
        case 'message':
          this.$Message.info(data.data)
          break
        default:
          break
      }
    },
    websocketsend (data) {
      // 有连接并且保持连接时才可以send
      if (this.ws.websock === null || this.ws.websock.readyState !== 1) return
      console.log('push')

      this.ws.websock.send(data)
    },
    websocketclose (e) { // 关闭
      console.log('断开连接', e)
    },
    // 推代码
    pushCode (code = null) {
      let obj = {
        type: 'push',
        data: {
          language: this.selectedLanguage,
          version: this.selectedVersion,
          code: code === null ? this.wsCode : code
        }
      }
      this.websocketsend(JSON.stringify(obj))
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
