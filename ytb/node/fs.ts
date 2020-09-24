import * as fsSync from 'fs'
import fs from 'fs/promises'


const mkdir = async () => {
    try {
        await fs.mkdir('dir')
        console.log('success'); 
    } catch (error) {
        console.error('fail', error);
    }   
}

const writeTxT = async () => {
    try {
        await fs.writeFile('./dir/hello.tx',`
            当 dir 不存在时报错， hello.txt 不存在时会自动创建，
            重新执行或覆盖原来的内容，
            异步地将数据写入到一个文件，如果文件已存在则覆盖该文件。 data 可以是字符串或 buffer。 Promise 将会在成功时解决，且不带参数。
            如果 data 是 buffer，则 encoding 选项会被忽略。            
            如果 options 是字符串，则它指定字符编码。            
            指定的 FileHandle 必须支持写入。            
            在同一个文件上多次使用 fsPromises.writeFile() 且不等待 Promise 被解决（或被拒绝）是不安全的。
        `,)
    } catch (error) {
        console.error('fail', error);
    }
}
const writeAJson = async () => {
    try {
        await fs.writeFile('./dir/package.json',`
            {
                "name": "k-cli",
                "version": "1.0.0",
                "main": "src/index.js",
                "bin": {
                    "@kly/cli": "bin/create",
                    "k-cli": "bin/create"
                },
                "license": "MIT",
                "dependencies": {
                    "arg": "^4.1.3",
                    "chalk": "^4.1.0",
                    "esm": "^3.2.25",
                    "execa": "^4.0.3",
                    "inquirer": "^7.3.3",
                    "listr": "^0.14.3",
                    "ncp": "^2.0.0",
                    "pkg-install": "^1.0.0"
                }
            }
        
        `,)
    } catch (error) {
        console.error('fail', error);
    }
}

const rename = async () => {
    try {
        fs.rename('./newdir/hello.txt', './newdir/hello.md')
        console.log('rename success');
    } catch (error) {
        console.error('fail', error);
    }
}

const remove = async () => {
    try {
        fs.rmdir('./newdir/hello.md')
        console.log('success');
    } catch (error) {
        console.error('fail', error);
    }
}

const unlink = async () => {
    try {
        fs.unlink('./newdir/hello.md')
        console.log('success');
    } catch (error) {
        console.error('fail', error);
    }
}

const access = async() => {
    try {
        const res = await fs.access('./newdir',fsSync.constants.R_OK)
        console.log('success',res);
    } catch (error) {
        console.error('fail', error);
    }
}

const open = async (path) => {
    try {
        const res = await fs.opendir(path)
        console.log('打开文件夹成功');
        for await (const dirent of res) {
            try {
                const op  = await fs.open(path + '/' + dirent.name,'')
                console.log(`打开文件${dirent.name}成功`, op);
            } catch (error) {
                console.error(`打开文件${dirent.name}失败`, error);
            }
        }
    } catch (error) {
        console.error('打开文件夹失败', error);
    }
}
const read = async (path) => {
    try {
        const res = await fs.readdir(path)
        console.log('readdir 文件夹成功',res);
        for await (const file of res) {
            try {
                const op  = await fs.readFile(path + '/' + file)
                console.log(`读取文件${file}成功`, op);
            } catch (error) {
                console.error(`读取文件${file}失败`, error);
            }
        }
    } catch (error) {
        console.error('失败', error);
    }
}


read('./newdir')