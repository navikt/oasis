/**
 * @jest-environment jsdom
 */

import { Session, useSession } from "../../lib/client";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { SWRConfig } from "swr";
import { server } from "../../__mocks__/server";
import { rest } from "msw";
import { fetch } from "whatwg-fetch";
import { Router, useRouter } from "next/router";

jest.mock("next/router");

const push = jest.fn();
const mockRouter = {
  push,
} as unknown as Router;

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
mockUseRouter.mockReturnValue(mockRouter);

afterEach(() => {
  push.mockClear();
});

describe("client/useSession()", () => {
  test("Viser loader, så ikke innlogget", async () => {
    server.use(
      rest.get("/api/auth/session", (req, res, ctx) => res(ctx.json({})))
    );
    render(<ComponentMedUseSession enforceLogin={false} />, {
      wrapper: swrWrapper,
    });

    await waitForElementToBeRemoved(() => screen.queryByText(/isLoading/i));
    expect(screen.getByText(/Ikke innlogget/i)).toBeInTheDocument();

    expect(push).not.toHaveBeenCalled();
  });

  test("Redirecter til login om ikke innlogget", async () => {
    server.use(
      rest.get("/api/auth/session", (req, res, ctx) =>
        res(ctx.json<Session>({}))
      )
    );
    render(<ComponentMedUseSession />, {
      wrapper: swrWrapper,
    });

    // Mens vi venter på sesjon, eller asynk redirect skal loader vises
    expect(screen.getByText(/isLoading/i)).toBeInTheDocument();

    // Vent på redirect
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(expect.stringContaining("signin"));
    });

    // Skal ikke vise at sesjon mangler om vi har begynt redirect
    expect(screen.getByText(/isLoading/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ikke innlogget/i)).not.toBeInTheDocument();
  });

  test("Viser loader, så innlogget", async () => {
    server.use(
      rest.get("/api/auth/session", (req, res, ctx) =>
        res(ctx.json<Session>({ expires_in: 123 }))
      )
    );
    render(<ComponentMedUseSession />, { wrapper: swrWrapper });

    await waitForElementToBeRemoved(() => screen.queryByText(/isLoading/i));
    expect(screen.getByText(/Innlogget/i));
  });

  test("Viser feilmelding om noe går galt", async () => {
    server.use(
      rest.get("/api/auth/session", (req, res, ctx) =>
        res.networkError("Connection reset")
      )
    );

    render(<ComponentMedUseSession />, { wrapper: swrWrapper });

    await waitForElementToBeRemoved(() => screen.queryByText(/isLoading/i));
    expect(screen.getByText(/isError/i));
  });

  function ComponentMedUseSession({ enforceLogin = true }) {
    const { session, isLoading, isError } = useSession({ enforceLogin });

    if (isError) return <div>isError</div>;
    if (isLoading) return <div>isLoading</div>;
    if (session) return <div>Innlogget</div>;

    return <div>Ikke innlogget</div>;
  }

  function swrWrapper({ children }) {
    const fetcher = (
      url: RequestInfo,
      options: RequestInit = {}
    ): Promise<unknown> => fetch(url, options).then((r) => r.json());

    return (
      <SWRConfig
        value={{ provider: () => new Map(), dedupingInterval: 0, fetcher }}
      >
        {children}
      </SWRConfig>
    );
  }
});
