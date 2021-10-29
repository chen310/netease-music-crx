import * as encrypt from './encrypt'

// 网易 API 请求路径前缀
const API_PREFIX = 'https://music.163.com'

export default createRequester()

function createRequester () {
  let csrf = ''
  function createRequest (reqInfo) {
    let {
      method = 'post',
      baseURL = API_PREFIX,
      url,
      data
    } = reqInfo
    url = baseURL + url
    url += (url.indexOf('?') > -1 ? '&' : '?') + 'csrf_token=' + csrf
    data.csrf_token = csrf
    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Cookie: document.cookie
      },
      credentials: 'include',
      body: createQueryParams(data)
    }).then(res => {
      return res.json()
    })
  }
  return {
    setCookie (_cookies) {
      document.cookie = _cookies
      if (_cookies) {
        const csrfToken = (_cookies || '').match(/_csrf=([^(;|$)]+)/)
        csrf = csrfToken ? csrfToken[1] : ''
      } else {
        csrf = ''
      }
    },
    clearCookie () {
      delete document.cookie
      csrf = ''
    },
    // 手机登录
    cellphoneLogin (phone, captcha) {
      return createRequest({
        url: '/weapi/login/cellphone',
        data: {
          phone,
          captcha,
          countrycode: '86',
          rememberLogin: 'true'
        }
      })
    },
    // 刷新登录态
    loginRefresh () {
      return createRequest({
        url: '/weapi/login/token/refresh',
        data: {}
      })
    },
    // 发送验证码
    captchaSent (phone) {
      return createRequest({
        url: '/weapi/sms/captcha/sent',
        data: {
          cellphone: phone,
          ctcode: '86'
        }
      })
    },
    // 获取歌单
    getUserPlaylist (uid) {
      return createRequest({
        url: '/weapi/user/playlist',
        data: {
          offset: 0,
          uid,
          limit: 100
        }
      })
    },
    // 获取歌单详情
    getPlaylistDetail (id) {
      return createRequest({
        url: '/weapi/v3/playlist/detail',
        data: {
          id,
          n: 1000,
          s: 8
        }
      })
    },
    // 获取每日推荐歌曲
    getRecommendSongs () {
      return createRequest({
        url: '/weapi/v2/discovery/recommend/songs',
        data: {
          offset: 0,
          total: true,
          limit: 50
        }
      })
    },
    // 获取歌曲详情
    getSongDetail (ids) {
      const idsHash = ids.map(id => ({ id }))
      const idsStringify = JSON.stringify(ids)
      return createRequest({
        url: '/weapi/v3/song/detail',
        data: {
          c: JSON.stringify(idsHash),
          ids: idsStringify
        }
      })
    },
    // 获取音乐 url
    getSongUrls (ids) {
      return createRequest({
        url: '/weapi/song/enhance/player/url',
        data: {
          ids,
          br: 999000
        }
      })
    },
    // 喜欢音乐
    likeSong (id, isLike) {
      return createRequest({
        url: '/weapi/radio/like',
        data: {
          alg: 'itembased',
          trackId: id,
          like: isLike,
          time: '3'
        }
      })
    }
  }
}

function createQueryParams (data) {
  const cryptoReq = encrypt.encryptData(data)
  const body = new URLSearchParams()
  body.append('params', cryptoReq.params)
  body.append('encSecKey', cryptoReq.encSecKey)
  return body
}
