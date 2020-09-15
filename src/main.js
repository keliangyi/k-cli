import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import chalk from 'chalk'
import ncp from 'ncp'
import execa from 'execa'
import Listr from 'listr'
import { projectInstall } from 'pkg-install'



const access = promisify(fs.access)

const copy = promisify(ncp)

const copyTemplateFile = async (options) => {
    return copy(options.tempDir, options.targetDir, {
        clobber:false
    })
}

const initGit = async (options) => {
    const result = execa('git', ['init'], {
        cwd:options.targetDir
    })

    if(result.failed){
        return Promise.reject(new Error('init git 失败'))
    }
    return
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

    // console.log('复制文件中...')

    // await copyTemplateFile(options)

    const tasks = new Listr([
        {
            title:"复制文件",
            task:() => copyTemplateFile(options)
        },
        {
            title:"init git",
            task: () => initGit(options),
            enabled: () => options.git
        },
        {
            title:"安装依赖",
            task:() => projectInstall({
                cwd:options.targetDir
            }),
            skip:() => !options.runInstall ? "输入 --install 安装依赖" : undefined
        }
    ])

    await tasks.run()
    console.error("%s 项目创建成功", chalk.green.bold('DONE'))
    return true
}