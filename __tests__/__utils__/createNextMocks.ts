import { createMocks, RequestOptions, ResponseOptions } from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";
import { Request, Response } from "express";

export function createNextMocks(
  reqOptions?: RequestOptions,
  resOptions?: ResponseOptions
) {
  return createMocks<NextApiRequest & Request, NextApiResponse & Response>(
    reqOptions,
    resOptions
  );
}
