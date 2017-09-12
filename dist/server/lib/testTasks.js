'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Built-in tasks for testing after installation.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module lib/testTasks
 */

exports.default = {
  a: {
    clear(m) {
      m.value = null;
    },
    guard(m) {
      return !m.value;
    },
    execute(m) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({ some: 'data' });
        }, 200);
      });
    },
    afterExecute(m, res) {
      return res;
    },
    assign(m, res) {
      m.value = res;
    }
  }
};