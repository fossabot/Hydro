/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-dynamic-require */
import { argv } from 'yargs';
import {
    lib, service, model,
    builtinLib, builtinModel,
} from './common';
import * as bus from '../service/bus';

const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARR = /=>.*$/mg;
function parseParameters(fn: Function) {
    const code = fn.toString()
        .replace(COMMENTS, '')
        .replace(ARR, '');
    const result = code.slice(code.indexOf('(') + 1, code.indexOf(')'))
        .match(/([^,]+)/g).map((i) => i.trim());
    return result === null ? [] : result;
}

async function cli() {
    const [, modelName, func, ...args] = argv._;
    if (!global.Hydro.model[modelName]) {
        return console.error(`Model ${modelName} doesn't exist.`);
    }
    if (!global.Hydro.model[modelName][func]) {
        return console.error(`Function ${func} doesn't exist in model ${modelName}.`);
    }
    if (typeof global.Hydro.model[modelName][func] !== 'function') {
        return console.error(`${func} in model ${modelName} is not a function.`);
    }
    const parameterMin = global.Hydro.model[modelName][func].length;
    const parameters = parseParameters(global.Hydro.model[modelName][func]);
    const parameterMax = parameters.length;
    if (args.length > parameterMax) {
        console.error(`Too many arguments. Max ${parameterMax}`);
        return console.error(parameters.join(', '));
    }
    if (args.length < parameterMin) {
        console.error(`Too few arguments. Min ${parameterMin}`);
        return console.error(parameters.join(', '));
    }
    let result = global.Hydro.model[modelName][func](...args);
    if (result instanceof Promise) result = await result;
    return console.log(result);
}

export async function load() {
    const pending = global.addons;
    const fail = [];
    require('../lib/i18n');
    require('../utils');
    require('../error');
    require('../options');
    await new Promise((resolve) => {
        bus.once('database/connect', resolve);
        require('../service/db');
    });
    for (const i of builtinLib) require(`../lib/${i}`);
    await lib(pending, fail);
    require('../service/gridfs');
    await service(pending, fail);
    for (const i of builtinModel) require(`../model/${i}`);
    await model(pending, fail);
    await bus.parallel('app/started');
    await cli();
}
