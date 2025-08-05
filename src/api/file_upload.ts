import request from '../utils/request'


export function uploadFile(data: FormData) {
  return request({
    url: '/api/v1/openai/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}