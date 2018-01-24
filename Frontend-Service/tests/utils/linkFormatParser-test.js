const chai = require('chai');
const expect = chai.expect; 
const Parser = require("../../src/utils/linkFormatParser");

describe('LinkFormatParser', function () {
    it('Link Format Parser returns correct JSON (simple input)', function () {
        const res = Parser.parse("</.well-known/core>;ct=40,</LED/green>;ct=0;rt=LED;val=1;name=MyLovelyLED;node=PrimarkBillboard");
        expect(res.length).to.equal(2);
        const first = res[0];
        const second = res[1];
        expect(first.url).to.equal("/.well-known/core");
        expect(first.ct).to.equal('40');
        expect(second.url).to.equal('/LED/green');
        expect(second.ct).to.equal('0');
        expect(second.rt).to.equal('LED');
        expect(second.val).to.equal('1');
        expect(second.name).to.equal('MyLovelyLED');
        expect(second.node).to.equal('PrimarkBillboard');
    });
});