import chalk from 'chalk'
import fs from 'fs'
import ncp from 'ncp'
import path from 'path'
import { promisify } from 'util'


const access = promisify(fs.access)

const copy = promisify(ncp)

const copyTemplateFile = async (options) => {
    return copy(options.tempDir, options.targetDir, {
        clobber:false
    })
}


export const createProject = async (options) => {
    options = {
        ...options,
        targetDir:options.targetDir || process.cwd(),
    }

    const currentFileUrl = import.meta.url
    console.log(currentFileUrl);
    const tempDir = path.resolve(
        new URL(currentFileUrl).pathname.slice(1),
        '../../templates',
        options.template.toLowerCase()
    )
    console.log(new URL(currentFileUrl).pathname);
    options.tempDir = tempDir

    try {
        await access(tempDir,fs.constants.R_OK)
    } catch (error) {
        console.error(error,"%s 无效的templae 名称", chalk.red.bold('ERROR'))
        process.exit(1)
    }

    console.log('复制文件中...')

    await copyTemplateFile(options)

    console.error("%s 项目创建成功", chalk.green.bold('DONE'))
    return true
}