// very-mini-syntax.js
// Extremely compact JavaScript syntax cheatsheet — runnable examples.

// Values & variables
const PI = 3.14159;        // constant
let count = 0;             // mutable
var legacy = "works";      // avoid in modern code

// Types (examples)
const str = "hello";
const num = 42;
const bool = true;
const nothing = null;
const undef = undefined;
const sym = Symbol("id");

// Template literal
const name = "A";
console.log(`Hi ${name}, count = ${count}`);

// Functions
function add(a, b) {
    return a + b;
}
const mul = (a, b) => a * b; // arrow function (concise)

// Object and destructuring
const user = { id: 1, username: "u1", meta: { active: true } };
const { username, meta: { active } } = user;
console.log(username, active);

// Array
const arr = [1, 2, 3];
const [first, ...rest] = arr; // rest operator
console.log(first, rest);

// Class
class Person {
    constructor(name) { this.name = name; }
    greet() { return `Hi ${this.name}`; }
}
const p = new Person("B");
console.log(p.greet());

// Control flow
if (count === 0) console.log("zero");
for (let i = 0; i < 3; i++) console.log(i);

// Promise / async
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function demoAsync() {
    await wait(10);
    console.log("async done");
}
demoAsync();

// Short utilities
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
console.log(clamp(5, 0, 3)); // 3

// Export (CommonJS or ES Module examples)
// module.exports = { add, mul }; // CommonJS
// export { add, mul };          // ES Module

// End of mini syntax