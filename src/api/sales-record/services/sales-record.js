'use strict';

/**
 * sales-record service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::sales-record.sales-record');
