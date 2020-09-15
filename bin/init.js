#!/usr/bin/env node
const package = require('../package');
const { Command } = require('commander');
const { CreateCommand } = require('../src/commands');

const program = new Command();

program
  .version(package.version, '-v, --version', 'display version for vta-cli')
  .usage('<command> [options] table header');

program
  .option('-y, --yes', 'run default action')
  .option('-f, --force', 'force all the question')

program.command('create <name>')
  .description('create a vta template project')
  .option('-f, --force', '忽略文件夹检查，如果已存在则直接覆盖')
  .action((source, destination) => {  // source create后面跟着项目名称, destionation linux命令的对象
    // Option {
    // flags: '-f, --force',
    // required: false,
    // optional: false,
    // mandatory: false,
    // negate: false,
    // short: '-f',
    // long: '--force',
    // description: '忽略文件夹检查，如果已存在则直接覆盖',
    // defaultValue: undefined } ],
    new CreateCommand(source, destination)
  });
  // console.log(222222)
/**
 * 注意要使用program.parse()方式
 * 而不是直接在上面的链式调用之后直接xxx.parse()调用
 * 不然就会作为当前command的parse去处理了，从而help命令等都与你的预期不符合了
 */
try {
  program.parse(process.argv);
} catch (error) {
  console.log('err: ', error)
}
