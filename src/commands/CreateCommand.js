#!/usr/bin/env node
const path = require('path');
const ora = require('ora');
const fs = require('fs-extra');
const download = require('download-git-repo');
const { copyFiles, parseCmdParams, getGitUser, runCmd, log } = require('../utils');
const { exit } = require('process');
const inquirer = require('inquirer');
const { InquirerConfig, RepoPath, InquirerCon } = require('../utils/config');

/**
 * class 项目创建命令
 *
 * @description
 * @param {} source 用户提供的文件夹名称
 * @param {} destination 用户输入的create命令的参数
 */
class Creator {
  constructor(source, destination, ops = {}) {
    this.source = source
    this.cmdParams = parseCmdParams(destination)
    this.RepoMaps = Object.assign({
      repo: RepoPath,  // 仓库模板地址
      temp: path.join(__dirname, '../../__temp__'), // 下载到仓库的临时绝对路径
      target: this.genTargetPath(this.source)  // 项目所在绝对路径
    }, ops);
    this.gitUser = {}
    console.log(this.cmdParams);
    this.spinner = ora()
    this.init()
  }

  // 生成目标文件夹的绝对路径
  genTargetPath(relPath = 'vue-ts-template') {
    // process.cmd() // 获取项目所在的绝对地址
    return path.resolve(process.cwd(), relPath);
  }

  // 初始化函数
  async init() {
    // await this.updatePkgFile1();
    // getGitUser();
    try {
      await this.checkFolderExist();
      await this.downloadRepo();
      await this.copyRepoFiles();
      await this.updatePkgFile1();
      await this.initGit1();
      await this.runApp1();
    } catch (error) {
      console.log('')
      log.error(error);
      exit(1)
    } finally {
      this.spinner.stop();
    }
  }

  // 监测文件夹是否存在
  checkFolderExist() {
    return new Promise(async (resolve, reject) => {
      const { target } = this.RepoMaps
      // 如果create附加了--force或-f参数，则直接执行覆盖操作
      if (this.cmdParams.force) {
        await fs.removeSync(target)
        return resolve()
      }
      try {
        // 否则进行文件夹检查
        const isTarget = await fs.pathExistsSync(target)
        console.log(isTarget);
        if (!isTarget) return resolve()
        // inquirer// 询问者
        // const { recover } = await inquirer.prompt(InquirerConfig.folderExist);
        const { recover } = await inquirer.prompt(InquirerCon.folderExist)
        if (recover === 'cover') {
          await fs.removeSync(target);
          return resolve();
        } else if (recover === 'newFolder') {
          const { inputNewName } = await inquirer.prompt(InquirerCon.rename);
          this.source = inputNewName;
          this.RepoMaps.target = this.genTargetPath(`./${inputNewName}`);
          return resolve();
        } else {
          exit(1);
        }
      } catch (error) {
        log.error(`[vta]Error:${error}`)
        exit(1);
      }
    })
  }

  // 下载repo资源
  downloadRepo() {
    this.spinner.start('正在从远程git仓库。。。');
    const { repo, temp} = this.RepoMaps;
    return new Promise(async (resolve, reject) => {
        await fs.removeSync(temp);
        download(repo, temp, async err => {
          if(err) return reject(err);
          this.spinner.succeed('远程仓库下载成功');
          return resolve();
        })
    })
  }

  // 拷贝repo资源
  async copyRepoFiles() {
    const { temp, target } = this.RepoMaps;
    // fs.copySync();
    await copyFiles(temp, target, ['./git', './changelogs']);
  }

  // 找到目标地址的package.json：this.RepoMaps.target,  获取邮箱 读，写，即可
  async updatePkgFile1() {
      this.spinner.start('正在更新package.json...');
      const pkgPath = path.resolve(this.RepoMaps.target, 'package.json');
      // 获取package.json的信息
      const pgkJson = fs.readJsonSync(pkgPath);
      // 获取 git信息
      const {name, email } = getGitUser();
      // 修改package.json
      Object.assign(pgkJson, {
        name: this.source,
        author: name && email ? `${name} ${email}`: '',
        version: '1.0.0'
      })
      // 写入package.json
      await fs.writeJsonSync(pkgPath, pgkJson, { spaces: '\t'});
      this.spinner.succeed('更改package.json完成')
  }
  // 切换到目标地址 开启process.chdir 运行命令
  async initGit1() {
      this.spinner.start('开始初始化git');
      await runCmd(`cd ${this.RepoMaps.target}`);
      process.chdir(this.RepoMaps.target);
      await runCmd('git init');
      this.spinner.succeed('git初始化成功');
  }

  // 告知用户咋样启动项目
  async runApp1() {
      this.spinner.start('正在初始化项目，请稍等.....');
      // try {
      //   await runCmd('npm install --registry=https://registry.npm.taobao.org');
      //   await runCmd('git add . && git commit -m "init 初始化项目"');
      //   this.spinner.succeed('依赖安装成功');
      //   console.log('请执行如下命令：/n');
      //   log.success(`cd ${this.source}`);
      //   log.success('npm run serve')
      // } catch(e) {
        console.log('安装依赖失败，请手动安装依赖：/n');
        log.success(`cd ${this.source}`);
        log.success('npm install');
        log.success('npm run serve')
      // }
     
  }
  // 更新package.json文件
  async updatePkgFile() {
    this.spinner.start('正在更新package.json...');
    const pkgPath = path.resolve(this.RepoMaps.target, 'package.json');
    const unnecessaryKey = ['keywords', 'license', 'files']
    const { name = '', email = '' } = await getGitUser(); // 远程git仓库的姓名跟邮件

    const jsonData = fs.readJsonSync(pkgPath);
    unnecessaryKey.forEach(key => delete jsonData[key]);
    Object.assign(jsonData, {
      name: this.source,
      author: name && email ? `${name} ${email}` : '',
      provide: true,
      version: "1.0.0"
    });
    // 将其希尔项目的package.json
    await fs.writeJsonSync(pkgPath, jsonData, { spaces: '\t' })
    this.spinner.succeed('package.json更新完成！');
  }

  // 初始化git文件
  async initGit() {
    this.spinner.start('正在初始化Git管理项目...');
    await runCmd(`cd ${this.RepoMaps.target}`);
    process.chdir(this.RepoMaps.target);
    await runCmd(`git init`);
    this.spinner.succeed('Git初始化完成！');
  }

  // 安装依赖
  async runApp() {
    try {
      // this.spinner.start('正在安装项目依赖文件，请稍后...');
      // await runCmd(`npm install --registry=https://registry.npm.taobao.org`);
      // await runCmd(`git add . && git commit -m"init: 初始化项目基本框架"`);
      // this.spinner.succeed('依赖安装完成！');

      // console.log('请运行如下命令启动项目吧：\n');
      // log.success(`   cd ${this.source}`);
      // log.success(`   npm run serve`);
    } catch (error) {
      console.log('项目安装失败，请运行如下命令手动安装：\n');
      log.success(`   cd ${this.source}`);
      log.success(`   npm run install`);
    }
  }
}

module.exports = Creator;
