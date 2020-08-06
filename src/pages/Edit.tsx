import React, { useState, useEffect } from "react";
import update from "immutability-helper";
import LZString from "lz-string";
import { GeneratorData } from "../types";
import { RouteComponentProps, Link } from "react-router-dom";
import Dialog from "../components/Dialog";

interface EditPageParams {
  code: string;
}
const EditPage = ({ match, history }: RouteComponentProps<EditPageParams>) => {
  const [data, setData] = useState<GeneratorData>(
    (() => {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(
          match.params.code
        );
        if (decompressed === null) {
          return { lists: [], template: "" };
        }
        return JSON.parse(decompressed);
      } catch (e) {
        return { lists: [], template: "" };
      }
    })()
  );

  const [currentList, setCurrentList] = useState<number | null>(null);

  const base64Data = LZString.compressToEncodedURIComponent(
    JSON.stringify(data)
  );
  useEffect(() => {
    history.replace(`/edit/${base64Data}`);
  }, [base64Data, history]);

  return (
    <main className="App">
      <Dialog
        open={currentList !== null}
        onClose={() => {
          setCurrentList(null);
        }}
      >
        {currentList !== null ? (
          <div>
            <input
              value={data.lists[currentList].name}
              onChange={(e) => {
                const newName = e.target.value;
                setData((d) =>
                  update(d, {
                    lists: { [currentList]: { name: { $set: newName } } },
                  })
                );
              }}
            />
            <p>Items</p>
            {data.lists[currentList].items.map((item, itemIndex) => (
              <div>
                <input
                  value={item}
                  onChange={(e) => {
                    const newItem = e.target.value;
                    setData((d) =>
                      update(d, {
                        lists: {
                          [currentList]: {
                            items: { [itemIndex]: { $set: newItem } },
                          },
                        },
                      })
                    );
                  }}
                />
                <button
                  onClick={() =>
                    setData((d) =>
                      update(d, {
                        lists: {
                          [currentList]: {
                            items: {
                              $splice: [[itemIndex, 1]],
                            },
                          },
                        },
                      })
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setData((d) =>
                  update(d, {
                    lists: { [currentList]: { items: { $push: [""] } } },
                  })
                )
              }
            >
              Add item
            </button>
          </div>
        ) : null}
      </Dialog>

      <h1>Generator Generator</h1>

      <h2>Lists</h2>
      <div className="edit-lists-box">
        {data.lists.map((list, listIndex) => (
          <div key={listIndex} className="edit-list-box">
            <p>{list.name}</p>
            <ul>
              {list.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
            <button
              onClick={() => {
                setCurrentList(listIndex);
              }}
            >
              Edit
            </button>
            <button
              onClick={() =>
                setData((d) =>
                  update(d, {
                    lists: {
                      $splice: [[listIndex, 1]],
                    },
                  })
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            setData((d) =>
              update(d, {
                lists: {
                  $push: [
                    {
                      name: `List ${d.lists.length + 1}`,
                      items: [],
                      defaultCount: 1,
                    },
                  ],
                },
              })
            );
          }}
        >
          <p>Add a list</p>
        </button>
      </div>

      <h2>Template</h2>
      <input
        type="text"
        value={data.template}
        onChange={(e) => {
          const newTemplate = e.target.value;
          setData((d) => update(d, { template: { $set: newTemplate } }));
        }}
      />

      <h2>Link</h2>
      <Link to={`/${base64Data}`}>
        <p style={{ wordBreak: "break-all" }}>{base64Data}</p>
      </Link>
    </main>
  );
};

export default EditPage;
