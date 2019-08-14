import outdent from "outdent";
import createRelease from "../../../utils/createRelease";
import createReleaseCommit from "../createReleaseCommit";
import { NewChangeset } from "@changesets/types";

const fakeAllPackages = [
  { name: "package-a", config: { version: "1.0.0" } },
  { name: "package-b", config: { version: "1.0.0" } }
];
const simpleChangeset: NewChangeset = {
  summary: "This is a summary",
  releases: [{ name: "package-a", type: "minor" }],
  id: "abc123xy"
};
const simpleChangesetWithDeleted: NewChangeset = {
  summary: "This is a summary",
  releases: [{ name: "package-a", type: "minor" }],
  id: "abc123ph"
};

const simpleChangeset2: NewChangeset = {
  summary: "This is another summary",
  releases: [
    { name: "package-a", type: "patch" },
    { name: "package-b", type: "minor" }
  ],
  id: "abc123fh"
};

describe("createReleaseCommit", () => {
  it("should handle a single simple releaseObject with one released package", () => {
    const releaseObj = createRelease([simpleChangeset], fakeAllPackages);
    const commitStr = createReleaseCommit(releaseObj);
    expect(commitStr).toEqual(outdent`
      RELEASING: Releasing 1 package(s)

      Releases:
        package-a@1.1.0

      Dependents:
        []

      Deleted:
        []

    `);
  });
  it("should skip CI when the flag is passed", () => {
    const releaseObj = createRelease([simpleChangeset], fakeAllPackages);
    const commitStr = createReleaseCommit(releaseObj, { skipCI: true });
    expect(commitStr).toEqual(outdent`
      RELEASING: Releasing 1 package(s)

      Releases:
        package-a@1.1.0

      Dependents:
        []

      Deleted:
        []


      [skip ci]
    `);
  });

  it("should handle a single simple releaseObject with deleted package", () => {
    const releaseObj = createRelease(
      [simpleChangesetWithDeleted],
      fakeAllPackages
    );
    const commitStr = createReleaseCommit(releaseObj);
    expect(commitStr).toEqual(outdent`
      RELEASING: Releasing 1 package(s)

      Releases:
        package-a@1.1.0

      Dependents:
        []

      Deleted:
        package-c

    `);
  });

  it("should handle a multiple releases from one changeset", () => {
    const releaseObj = createRelease([simpleChangeset2], fakeAllPackages);
    const commitStr = createReleaseCommit(releaseObj);
    expect(commitStr).toEqual(outdent`
      RELEASING: Releasing 2 package(s)

      Releases:
        package-a@1.0.1
        package-b@1.1.0

      Dependents:
        []

      Deleted:
        []

    `);
  });

  it("should handle a merging releases from multiple changesets", () => {
    const releaseObj = createRelease(
      [simpleChangeset, simpleChangeset2],
      fakeAllPackages
    );
    const commitStr = createReleaseCommit(releaseObj);

    expect(commitStr).toEqual(outdent`
      RELEASING: Releasing 2 package(s)

      Releases:
        package-a@1.1.0
        package-b@1.1.0

      Dependents:
        []

      Deleted:
        []

    `);
  });
});
