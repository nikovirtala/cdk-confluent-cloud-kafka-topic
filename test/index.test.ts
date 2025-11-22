import { describe, expect, it } from "vitest";
import { Hello } from "../src/index";

describe("Hello", () => {
    it('should return "hello, world!"', () => {
        const hello = new Hello();
        expect(hello.sayHello()).toBe("hello, world!");
    });
});
