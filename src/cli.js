"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _argv, _templatesPath;
Object.defineProperty(exports, "__esModule", { value: true });
const arg_1 = __importDefault(require("arg"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const listr_1 = __importDefault(require("listr"));
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const util_1 = require("util");
const access = util_1.promisify(fs_1.default.access);
const copyFile = util_1.promisify(fs_1.default.copyFile);
class Cli {
    constructor(args) {
        _argv.set(this, {
            '--name': String,
            '--help': Boolean,
            '--version': Boolean,
            '--git': Boolean,
            '--typescript': Boolean,
            '-n': '--name',
            '-v': '--version',
            '-h': '--help',
            '-g': '--git',
            '-t': '--typescript'
        }
        //@ts-ignore
        );
        //@ts-ignore
        _templatesPath.set(this, path_1.join(new URL(import.meta.url).pathname.slice(1), '../../templates'));
        this.version = require('../package.json').version;
        this.parseArgsIntoOptions(args);
    }
    parseArgsIntoOptions(rawArgs) {
        var _a, _b, _c, _d, _e;
        const args = arg_1.default(__classPrivateFieldGet(this, _argv), { argv: rawArgs.splice(2) });
        this.options = {
            name: (_a = args._[0]) !== null && _a !== void 0 ? _a : args["--name"],
            typescript: (_b = args["--typescript"]) !== null && _b !== void 0 ? _b : false,
            help: (_c = args["--help"]) !== null && _c !== void 0 ? _c : false,
            version: (_d = args["--version"]) !== null && _d !== void 0 ? _d : false,
            git: (_e = args["--git"]) !== null && _e !== void 0 ? _e : false,
        };
    }
    showVersion() {
        console.log(chalk_1.default `Version： {bold.green ${this.version} } `);
        process.exit(1);
    }
    help() {
        console.log(chalk_1.default.cyan `
        Version  ${this.version}
        Syntax   k-cli <name> [...options]
        Examples k-cli 
                    k-cli my-app -t
                    k-cli -n my-app -t
        Options:
            -h, --help                      帮助，打印出这一段信息
            -v, --version                   版本号
            -n, --name                      项目的名称
            -t, --typescript                是否使用typescript
            -g, --git                       git init
        `);
        process.exit(1);
    }
    promptOptions() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const questions = this.setQuestions();
            const answers = yield inquirer_1.default.prompt(questions);
            this.options = Object.assign(Object.assign({}, this.options), { name: (_a = this.options.name) !== null && _a !== void 0 ? _a : answers.name, template: answers.template });
        });
    }
    setQuestions() {
        const questions = [];
        if (!this.options.name) {
            questions.push({
                type: 'input',
                name: "name",
                message: "请输入项目的名称:",
            });
        }
        const templates = fs_1.default.readdirSync(__classPrivateFieldGet(this, _templatesPath));
        questions.push({
            type: 'rawlist',
            name: "template",
            message: "请选择模板:",
            choices: templates
        });
        if (!this.options.git) {
            questions.push({
                type: 'confirm',
                name: "git",
                message: "是否初始化git:",
            });
        }
        return questions;
    }
    createProject() {
        return __awaiter(this, void 0, void 0, function* () {
            const templateDir = path_1.join(__classPrivateFieldGet(this, _templatesPath), this.options.template);
            try {
                yield access(templateDir, fs_1.default.constants.R_OK);
            }
            catch (error) {
                console.error(error, "%s 无效的templae 名称", chalk_1.default.red.bold('ERROR'));
                process.exit(1);
            }
            const tasks = new listr_1.default([
                {
                    title: "复制模板文件",
                    task: () => this.copyTemplateFile(templateDir)
                },
            ]);
        });
    }
    copyTemplateFile(templateDir) {
        return copyFile(templateDir, process.cwd());
    }
}
_argv = new WeakMap(), _templatesPath = new WeakMap();
exports.default = Cli;
