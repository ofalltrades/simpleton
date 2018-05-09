const fs = require('fs')

exports.inject = (parent_template_path, child_template_path) => (
  Promise.all([
    new Promise(resolve => {
      fs.readFile(parent_template_path, (error, parent_template) => { resolve(parent_template) })
    }),
    new Promise(resolve => {
      fs.readFile(child_template_path, (error, child_template) => { resolve(child_template) })
    })
  ]).then(([parent_template, child_template]) => (
    String.raw({ raw: [eval(`\`${parent_template}\``)] }, child_template)
  ))
)
