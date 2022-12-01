import { createRequest } from "../";

describe("createRequest", () => {
  it("should generate request config successfully with request body", () => {
    const createPet = createRequest<{
      requestBody: {
        id?: number;
        name: string;
      };
    }>("createPet", ({ requestBody }) => ({ url: `/api/v3/pets`, method: "POST", data: requestBody }));

    expect(createPet({ requestBody: { id: 10, name: "Tom" } })).toEqual({
      url: "/api/v3/pets",
      method: "POST",
      data: {
        id: 10,
        name: "Tom",
      },
    });
  });

  it("should generate request config successfully with request query", () => {
    const findPet = createRequest<{
      id: number;
      status: "available" | "pending" | "sold";
    }>("findPet", ({ id, status }) => ({ url: `/api/v3/pets/${id}`, method: "GET", params: { status } }));

    expect(findPet({ id: 10, status: "available" })).toEqual({
      url: "/api/v3/pets/10",
      method: "GET",
      params: {
        status: "available",
      },
    });
  });

  it("should append extra info in request function", () => {
    const deletePet = createRequest("deletePet", () => ({ url: "/api/v3/pets", method: "DELETE" }));

    expect(deletePet.TResp).toEqual({});
    expect(deletePet.TReq).toEqual({});
    expect(deletePet.requestId).toEqual("deletePet");
  });
});
