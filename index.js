/* eslint-env node */

const cors = require('micro-cors')();
const query = require('micro-query');
const { send } = require('micro');
const { days, getTZ } = require('./days');

const LRU = require('lru-cache');
const cache = new LRU({ max: 10000 });

function status(res) {
  const json = {};
  cache.forEach((value, key) => {
    if (key.startsWith('ip:')) return;
    json[key] = value;
  });

  send(res, 200, json);
}

const handler = async (req, res) => {
  if (req.url === '/favicon.ico') return send(res, 404);

  if (req.url === '/status') return status(res);

  let ip =
    req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '0.0.0.0';
  }

  if (ip === '0.0.0.0' || process.env.TEST) {
    ip = '8.8.8.8';
  }

  if (ip.includes(',')) {
    [ip] = ip.split(',');
  }

  const timezone = await getTZ(query(req).tz, ip);
  if (timezone) {
    const seen = cache.has(`ip:${ip}`);
    if (!seen) {
      cache.set(`ip:${ip}`, true);
      const count = cache.get(timezone.zone) || 0;
      cache.set(timezone.zone, count + 1);
      const total = cache.get('total') || 0;
      cache.set('total', total + 1);
    }
  }

  const current = await days(timezone, ip);
  const icon = current === 0 ? 'a29985' : '29885';

  const startOptions = { 11: 25, 10: 55 };
  const m = new Date().getMonth();

  const start = startOptions[m] || 312;

  /* const unit = current === 1 ? ' day' : ' days'; */
  const unit = current === 0 ? 'D PLAY' : ' D';

/* if current >=1 */
/*if ( current >= '1')  
  send(res, 200, {
    frames: [
      {
        goalData: {
          start: 312,
          current,
          end: 1,
          unit,
        },
        icon,
      },
    ],
  });
*/
/* if current >=1 */
/*if ( current == '0')*/
  send(res, 200, {
    frames: [
      {
        icon,
        "text":"Patch 1.61 for Cyberpunk 2077 is available accross all platforms!"
        }
    ],
  });
};

if (process.NODE_ENV !== 'test') module.exports = cors(handler);
module.exports.days = days;
