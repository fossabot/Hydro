import { BUILTIN_ROLES, PRIV } from './builtin';
import { Udoc } from '../interface';
import * as db from '../service/db';

const coll = db.collection('domain');
const collUser = db.collection('domain.user');

export async function add(domainId: string, owner: number, name: string, bulletin: string) {
    await coll.insertOne({
        _id: domainId, owner, name, bulletin, roles: BUILTIN_ROLES,
    });
    return domainId;
}

export function get(domainId: string) {
    return coll.findOne({ _id: domainId });
}

export function getMany(query: any, sort: any, page: number, limit: number) {
    return coll.find(query).sort(sort).skip((page - 1) * limit).limit(limit)
        .toArray();
}

export function getMulti(query: any = {}) {
    return coll.find(query);
}

export function edit(domainId: string, $set: any) {
    return coll.updateOne({ _id: domainId }, { $set });
}

export async function inc(domainId: string, field: string, n: number) {
    const res = await coll.findOneAndUpdate(
        { _id: domainId },
        { $inc: { [field]: n } },
        { returnOriginal: false },
    );
    return res.value;
}

export async function getList(domainIds: string[]) {
    const r = {};
    // eslint-disable-next-line no-await-in-loop
    for (const domainId of domainIds) r[domainId] = await get(domainId);
    return r;
}

export function setUserRole(domainId: string, uid: number, role: string) {
    return collUser.updateOne({ uid, domainId }, { role }, { upsert: true });
}

export async function getRoles(arg: string | any) {
    let ddoc;
    if (typeof arg === 'string') ddoc = get(arg);
    else ddoc = arg;
    const roles = [];
    const r = [];
    for (const role in ddoc.roles) {
        roles.push({ _id: role, perm: ddoc.roles[role] });
        r.push(role);
    }
    for (const role in BUILTIN_ROLES) {
        if (!r.includes(role)) {
            roles.push({ _id: role, perm: BUILTIN_ROLES[role] });
        }
    }
    return roles;
}

export async function setRoles(domainId: string, roles: any) {
    const current = await get(domainId);
    for (const role in roles) {
        current.roles[role] = roles[role];
    }
    return await coll.updateOne({ _id: domainId }, { $set: { roles: current } });
}

export async function addRole(domainId: string, name: string, permission: string) {
    const current = await get(domainId);
    current.roles[name] = permission;
    return await coll.updateOne({ _id: domainId }, { $set: { roles: current } });
}

export async function deleteRoles(domainId: string, roles: string[]) {
    const current = await get(domainId);
    for (const role of roles) delete current.roles[role];
    await Promise.all([
        coll.updateOne({ _id: domainId }, { $set: current }),
        collUser.updateMany({ domainId, role: { $in: roles } }, { $set: { role: 'default' } }),
    ]);
}

export async function getDomainUser(domainId: string, udoc: Udoc) {
    let dudoc = await collUser.findOne({ domainId, uid: udoc._id });
    dudoc = dudoc || {};
    if (udoc._id === 1) dudoc.role = 'guest';
    if (udoc.priv & PRIV.PRIV_MANAGE_ALL_DOMAIN) dudoc.role = 'admin';
    dudoc.role = dudoc.role || 'default';
    const ddoc = await get(domainId);
    dudoc.perm = ddoc.roles[dudoc.role] || BUILTIN_ROLES[dudoc.role];
    return dudoc;
}

export function setMultiUserInDomain(domainId: string, query: any, params: any) {
    return collUser.updateMany({ domainId, ...query }, { $set: params });
}

export function getMultiInDomain(domainId: string, query: any = {}) {
    return collUser.find({ domainId, ...query });
}

export function setUserInDomain(domainId: string, uid: number, params: any) {
    return collUser.updateOne({ domainId, uid }, { $set: params });
}

export async function incUserInDomain(domainId: string, uid: number, field: string, n = 1) {
    // @ts-ignore
    const dudoc = await getDomainUser(domainId, { _id: uid });
    dudoc[field] = dudoc[field] + n || n;
    await setUserInDomain(domainId, uid, { [field]: dudoc[field] });
    return dudoc;
}

export async function getDictUserByDomainId(uid: number) {
    const dudocs = await collUser.find({ uid }).toArray();
    const ddocs = await coll.find({ owner: uid }).toArray();
    const dudict = {};
    for (const dudoc of dudocs) {
        // eslint-disable-next-line no-await-in-loop
        dudict[dudoc.domainId] = await get(dudoc.domainId);
    }
    for (const ddoc of ddocs) {
        dudict[ddoc._id] = ddoc;
    }
    return dudict;
}

global.Hydro.model.domain = {
    getRoles,
    add,
    inc,
    get,
    getMany,
    edit,
    getMulti,
    getList,
    setRoles,
    addRole,
    deleteRoles,
    setUserRole,
    getDomainUser,
    setMultiUserInDomain,
    setUserInDomain,
    incUserInDomain,
    getMultiInDomain,
    getDictUserByDomainId,
};