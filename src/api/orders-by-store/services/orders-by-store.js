'use strict';

/**
 * orders-by-store service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::orders-by-store.orders-by-store');
