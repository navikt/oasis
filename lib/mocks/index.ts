if (process.env.NEXT_RUNTIME == "nodejs") {
  import("./server").then(({ server }) => {
    server.listen();
  });
}

export default {};
