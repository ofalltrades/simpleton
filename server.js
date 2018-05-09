const http          = require('http'),
      url           = require('url'),
      fs            = require('fs'),
      eval_template = require('./bin/eval-template'),

      PORT      = 8888,
      HOSTNAME  = '127.0.0.1'

/* schema: { contacts: [{ id: String, name: String }] } */
let db = { contacts: [] }

const status_codes = {
  OK:                 200,
  CREATED:            201,
  BAD_REQUEST:        400,
  FORBIDDEN:          403,
  NOT_FOUND:          404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT:           409
}

const pathname_items = {
  COLLECTION_INDEX: 0,
  RESOURCE_INDEX:   1
}

const REMOVE_ONE_ELEMENT = 1,
      content_types = {
        PLAIN: 'text/plain',
        HTML:  'text/html',
        JSON:  'text/json'
      }


const html_template = (collection, record_id = null) => {
  const path = record_id ? `./views/${collection}/show.html` : `./views/${collection}/index.html`
  return eval_template.eval('index.html', path)
}

const accepts = ({ headers: { accept } }, type) => accept.includes(`text/${type}`)

const start_server = (...{ port = PORT, hostname = HOSTNAME }) => (
  // URI Form: /collection/resource ; e.g. /contacts/{id}
  http.createServer((request, response) => {
    const request_url                 = url.parse(request.url, true),
          params                      = request_url.query,
          [, collection, record_id]   = request_url.pathname.split('/')

    if (db[collection]) {
      switch (request.method) {
        /*****    Create    *****/
        case 'POST': {
          if (record_id) {
            const resource_exists = db[collection][record_id],
                  status_code = resource_exists ? status_codes.CONFLICT : status_codes.NOT_FOUND

            response.writeHead(status_code, { 'Content-Type': content_types.PLAIN })
          } else {
            db[collection].push(params)
            response.writeHead(status_codes.CREATED, { 'Content-Type': content_types.PLAIN })
          }
        } break


        /*****    Read    *****/
        case 'GET': {
          if (accepts(request, 'html')) {
            html_template(collection, record_id).then(template => {
              const status_code = template ? status_codes.OK : status_codes.NOT_FOUND

              response.writeHead(status_code, { 'Content-Type': content_types.HTML })
              response.write(template)
              response.end()
            })
          } else if (accepts(request, 'json')) {
            const template = record_id ? db[collection][record_id] : db[collection],
                  status_code = template ? status_codes.OK : status_codes.NOT_FOUND

            response.write(template)
            response.writeHead(status_code, { 'Content-Type': content_types.Plain })
            response.end()
          }
        } break


        /*****    Update/Replace   *****/
        case 'PUT': {
          Object.assign(db[collection].find(record => record.id === record_id), params)

        } break


        /*****    Update/Modify    *****/
        case 'PATCH': {

        } break


        /*****    Delete   *****/
        case 'DELETE': {
          let status_code = status_codes.METHOD_NOT_ALLOWED
          const queried_record = db[collection].find(record => record.id === record_id)

          if (queried_record) {
            const record_index = db.contacts.indexOf(queried_record)
            db.contacts.splice(record_index, REMOVE_ONE_ELEMENT)
            status_code = status_codes.OK
          } else {
            status_code = status_codes.NOT_FOUND
          }

          response.writeHead(status_code, { 'Content-Type': content_types.PLAIN })

        } break


        default:
          response.writeHead(status_codes.FORBIDDEN, { 'Content-Type': content_types.PLAIN })
      }
    } else {
      response.writeHead(status_codes.BAD_REQUEST, { 'Content-Type': content_types.PLAIN })
    }
  }).listen(
    port,
    hostname,
    () => console.log(`\nServer running at http://${hostname}:${port}/`)
  )
)

start_server()


/*****    TESTS     *****/
const assert = require('assert')
