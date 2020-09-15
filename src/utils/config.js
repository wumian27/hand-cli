exports.InquirerConfig = {
  // 文件夹已存在的名称的询问参数
  folderExist: [{
    type: 'list',
    name: 'recover',
    message: '当前文件夹已存在，请选择操作：',
    choices: [
      { name: '创建一个新的文件夹3', value: 'newFolder' },
      { name: '覆盖', value: 'cover' },
      { name: '退出', value: 'exit' },
    ]
  }],
  // 重命名的询问参数
  rename: [{
    name: 'inputNewName',
    type: 'input',
    message: '请输入新的项目名称: '
  }]
}

// 远程Repo地址wumian27/construction-react
exports.RepoPath = 'github:wumian27/construction-react'

exports.InquirerCon = {
  folderExist: [
    {
      type: 'list',
      name: 'recover',
      message: '当前文件夹存在，请选择你的操作：',
      choices: [
        {
          name: '重新创建一个新文件', value: 'newFolder',
        },
        {
          name: '覆盖', value: 'cover',
        },
        {
          name: '退出', value: 'exit'
        }
      ]
    }
  ],

  // 重新命名
  rename: [
    {
      type: 'input',
      name: 'inputName',
      message:'请输入文件夹名称'
    }
  ]
}
