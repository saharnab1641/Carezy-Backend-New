import { Router } from "express";

// import { AuthRoutes } from './auth/routes';

/**
 * Init Express api routes
 *
 * @param {Router} router
 * @param {string} prefix
 * @returns {void}
 */
export function registerApiRoutes(router: Router, prefix: string = ""): void {
  // router.use(`${prefix}/auth`, new AuthRoutes().router);
}
