import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const EvidenceGraphComponent = ({ evidenceGraph }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const g = svg.append("g").attr("transform", "translate(100,0)");

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", function (event) {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const tree = d3.tree().size([height, width - 160]);

    let root;
    let i = 0;

    function update(source) {
      const treeData = tree(root);
      const nodes = treeData
        .descendants()
        .filter((d) => d.data.visible !== false);
      const links = treeData
        .links()
        .filter(
          (d) =>
            d.source.data.visible !== false && d.target.data.visible !== false
        );

      nodes.forEach((d) => {
        d.y = (d.depth - 1) * 180 + (d.data.type === "property" ? 90 : 180);
      });

      const node = g
        .selectAll(".node")
        .data(nodes, (d) => d.id || (d.id = ++i));

      const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.y},${d.x})`)
        .on("click", click);

      nodeEnter
        .append("circle")
        .attr("r", 10)
        .style("fill", (d) => {
          if (d.data.type === "property") {
            return d.data.nameOnly ? "#66BFFF" : "#E6F7FF";
          }
          return d.children ? "#FFFF99" : "#FFEF00";
        });

      nodeEnter
        .append("text")
        .attr("dy", ".35em")
        .attr("x", (d) => (d.children || d._children ? -13 : 13))
        .attr("text-anchor", (d) =>
          d.children || d._children ? "end" : "start"
        )
        .text((d) => {
          if (d.data.type === "property") {
            return d.data.nameOnly
              ? `${d.data.name}:`
              : `${d.data.name}: ${d.data.value}`;
          }
          return d.data.name;
        });

      const nodeUpdate = nodeEnter.merge(node);

      nodeUpdate
        .transition()
        .duration(500)
        .attr("transform", (d) => `translate(${d.y},${d.x})`);

      nodeUpdate
        .select("circle")
        .transition()
        .duration(500)
        .style("fill", (d) => {
          if (d.data.type === "property") {
            return d.data.nameOnly ? "#66BFFF" : "#E6F7FF";
          }
          return d.children ? "#FFFF99" : "#FFEF00";
        });

      nodeUpdate
        .select("text")
        .transition()
        .duration(500)
        .text((d) => {
          if (d.data.type === "property") {
            return d.data.nameOnly
              ? `${d.data.name}:`
              : `${d.data.name}: ${d.data.value}`;
          }
          return d.data.name;
        });

      const nodeExit = node
        .exit()
        .transition()
        .duration(500)
        .attr("transform", (d) => `translate(${source.y},${source.x})`)
        .remove();

      const link = g.selectAll(".link").data(links, (d) => d.target.id);

      const linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x)
        );

      const linkUpdate = linkEnter.merge(link);

      linkUpdate
        .transition()
        .duration(250)
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x)
        );

      link.exit().transition().duration(250).remove();

      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    function click(event, d) {
      if (d.data.type === "property") {
        d.data.nameOnly = !d.data.nameOnly;
        update(d);
      } else {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }
    }

    function processData(data) {
      function recurse(value) {
        if (value != null && typeof value === "object") {
          let children = [];
          for (let k in value) {
            if (value.hasOwnProperty(k)) {
              if (typeof value[k] === "object" && value[k] !== null) {
                if (Array.isArray(value[k])) {
                  value[k].forEach((item, index) => {
                    children.push(
                      recurse({
                        name: `${k} ${index}`,
                        ...item,
                      })
                    );
                  });
                } else {
                  children.push(
                    recurse({
                      name: k,
                      ...value[k],
                    })
                  );
                }
              } else {
                children.push({
                  name: k,
                  value: value[k],
                  type: "property",
                  visible: true,
                  textVisible: true,
                  nameOnly: k === "description",
                });
              }
            }
          }
          return {
            name: value.name || value.id || "Node",
            children: children,
            visible: true,
            type: value.type || "default",
          };
        }
        return value;
      }
      return recurse(data);
    }

    const jsonData = evidenceGraph;
    root = d3.hierarchy(processData(jsonData), (d) => d.children);
    root.x0 = height / 2;
    root.y0 = 0;

    update(root);
  }, [evidenceGraph]);

  return <svg ref={svgRef} width="960" height="600"></svg>;
};

export default EvidenceGraphComponent;
