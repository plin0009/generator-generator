import React, { useState, useEffect, useRef, useCallback } from "react";
import { RouteComponentProps } from "react-router-dom";
import LZString from "lz-string";

import { GeneratorList, GeneratorData } from "../types";

const generateItems = (count: number, items: string[]) => {
  const itemsLeft = [...items];
  const itemsSelected = [];
  while (count) {
    count--;
    const index = Math.floor(Math.random() * itemsLeft.length);
    itemsSelected.push(itemsLeft.splice(index, 1)[0]);
  }
  return itemsSelected;
};

const toOxfordCommaList = (list: string[]) => {
  if (list.length < 3) {
    return list.join(" and ");
  }
  return (
    list.slice(0, list.length - 1).join(", ") + ", and " + list[list.length - 1]
  );
};

interface GeneratorPageParams {
  code: string;
}

type Counts = Record<string, number>;

const GeneratorPage = ({ match }: RouteComponentProps<GeneratorPageParams>) => {
  const data: GeneratorData | null = useRef(
    (() => {
      try {
        const decompressed = LZString.decompressFromBase64(match.params.code);
        if (decompressed === null) {
          return null;
        }
        return JSON.parse(decompressed);
      } catch (e) {
        return null;
      }
    })()
  ).current;

  const [counts, setCounts] = useState<Counts>(
    (() => {
      if (data === null) {
        return {};
      }
      const c: Counts = {};
      for (let i = 0; i < data.lists.length; i++) {
        const list = data.lists[i] as GeneratorList;
        c[list.name] = list.defaultCount;
      }
      return c;
    })()
  );

  const [idea, setIdea] = useState("");
  const [color, setColor] = useState("rgb(0,0,0)");

  const regenerate = useCallback(() => {
    setIdea(() => {
      if (data === null || counts === null) {
        return "";
      }
      let template = data.template;
      for (let i = 0; i < data.lists.length; i++) {
        const list = data.lists[i];
        template = template.replace(new RegExp(`\\$${i + 1}`, "g"), () => {
          return toOxfordCommaList(
            generateItems(counts[list.name], list.items)
          );
        });
      }
      return template;
    });

    setColor(() => {
      const r = Math.random() * 160 + 90;
      const g = Math.random() * 170 + 40;
      const b = Math.random() * 215 + 40;

      const r2 = r - (20 + Math.random() * 60);
      const g2 = g - (20 + Math.random() * 60);
      const b2 = b - (20 + Math.random() * 100);

      const color1 = `rgb(${r}, ${g}, ${b})`;
      const color2 = `rgb(${r2}, ${g2}, ${b2})`;
      return `-webkit-linear-gradient(${color1}, ${color2})`;
    });
  }, [data, counts]);

  useEffect(() => {
    regenerate();
    const regenerateIfSpace = (e: KeyboardEvent) => {
      if (e.key === " ") {
        regenerate();
      }
    };
    document.addEventListener("keyup", regenerateIfSpace);
    return () => document.removeEventListener("keyup", regenerateIfSpace);
  }, [regenerate]);

  if (data === null) {
    return <div></div>;
  }
  return (
    <main className="App">
      <div className="idea-wrapper">
        <p className="idea" style={{ backgroundImage: color }}>
          {idea}
        </p>
      </div>

      <div>
        {data.lists.map((list, listIndex) => {
          if (counts === null) {
            return null;
          }
          return (
            <div className="num-input-wrapper" key={listIndex}>
              <label className="num-input-label" htmlFor="numCategoriesInput">
                {list.name}:{" "}
              </label>
              <input
                type="number"
                className="num-input"
                min={1}
                max={list.items.length}
                value={counts[list.name]}
                onChange={(e) => {
                  // setNumCategories(+e.target.value);
                  const newCount = +e.target.value;
                  setCounts((c) => {
                    c[list.name] = newCount;
                    return { ...c };
                  });
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="generate-area">
        <button onClick={regenerate}>Another one!</button>
        <p className="generate-prompt">Or press SPACE</p>
      </div>
    </main>
  );
};

export default GeneratorPage;
