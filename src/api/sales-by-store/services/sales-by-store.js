'use strict';

/**
 * sales-by-store service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::sales-by-store.sales-by-store');
