/**
 * 这个仅用于客户端的模块包含与身份验证相关的所有内容，并且用于
 * 避免在服务器包中导入 `@webcontainer/api`。
 */

export { auth, type AuthAPI } from '@webcontainer/api';
