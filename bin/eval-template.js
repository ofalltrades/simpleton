// jake-up template language parser
const fs = require('fs')

exports.eval = (parent_template_path, child_template_path) => (
  new Promise(resolve => {
    fs.readFile(parent_template_path, (error, parent_template) => {
      if (error) throw error
      resolve(parent_template)
    })
  }).then(parent_template => (
    new Promise(resolve => {
      fs.readFile(child_template_path, (error, child_template) => {
        if (error) throw error
        const template = String.raw({ raw: [eval(`\`${parent_template}\``)] }, child_template)
        resolve(template.toString())
      })
    })
  ))
)
