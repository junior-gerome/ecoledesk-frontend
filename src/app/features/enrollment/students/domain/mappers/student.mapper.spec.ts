import { Gender } from "@app/enums/gender";
import { TypeParent } from "@app/features/parent/domain/enums/typeParent.enum";
import { createApiStudent } from "../../testing/students-test.fixtures";
import { StudentMapper } from "./student.mapper";

describe("StudentMapper", () => {
  it("should map API students to domain entities", () => {
    const mapped = StudentMapper.fromApi(
      createApiStudent({
        id: 12,
        lastNameStudent: "Doe",
        firstNameStudent: "Jane",
        dateOfBirth: [2015, 6, 1] as unknown as Date,
        registrationDate: "2026-09-01" as unknown as Date,
        gender: Gender.FEMININ,
        ecolePrecedente: "Groupe scolaire A",
        parent: {
          id: 2,
          typeParent: TypeParent.MERE,
          lastNameParent: "Doe",
          firstNameParent: "Maria",
          professionParent: "Commercante",
          address: "Douala",
          phoneNumber: "670000000",
          email: "maria@example.com",
        },
      }),
    );

    expect(mapped.id).toBe("12");
    expect(mapped.dateOfBirth instanceof Date).toBeTrue();
    expect(mapped.parent?.typeParent).toBe(TypeParent.MERE);
  });

  it("should map domain entities back to API payloads", () => {
    const payload = StudentMapper.toApi({
      id: "12",
      lastNameStudent: "Doe",
      firstNameStudent: "Jane",
      dateOfBirth: "2015-06-01",
      registrationDate: "2026-09-01",
      gender: Gender.FEMININ,
      ecolePrecedente: "Groupe scolaire A",
      parent: {
        id: "2",
        typeParent: TypeParent.MERE,
        lastNameParent: "Doe",
        firstNameParent: "Maria",
        professionParent: "Commercante",
        address: "Douala",
        phoneNumber: "670000000",
        email: "maria@example.com",
      },
    });

    expect(payload.id).toBe(12);
    expect(payload.lastNameStudent).toBe("Doe");
    expect(payload.parent.typeParent).toBe(TypeParent.MERE);
  });

  it("should create an empty parent when API data is missing", () => {
    const parent = StudentMapper.parentFromApi(null);

    expect(parent.id).toBeNull();
    expect(parent.lastNameParent).toBe("");
    expect(parent.phoneNumber).toBe("");
  });
});
