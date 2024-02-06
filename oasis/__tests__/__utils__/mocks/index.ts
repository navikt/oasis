async function initMocks() {
  if (typeof window === "undefined") {
    const { server } = await import("./server");
    server.listen();
    server.listHandlers().forEach((handler) => {
      console.log(handler.info.header);
    });
  }
}

initMocks();

export {};
