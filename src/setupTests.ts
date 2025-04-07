// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock para resolver problemas com react-router-dom
jest.mock("react-router-dom", () => jest.requireActual("react-router-dom"));
