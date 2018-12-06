const chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai');
const sandbox = sinon.createSandbox();

global.expect = chai.expect;
global.sinon = sinon;
chai.use(sinonChai);