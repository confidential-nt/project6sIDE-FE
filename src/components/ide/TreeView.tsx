import React from "react";
import { Tree, NodeRendererProps, NodeApi } from "react-arborist";
import { IdObj } from "react-arborist/dist/types/utils";
import { AiOutlineFolder } from "react-icons/ai";
import { BiSolidRightArrow, BiSolidDownArrow } from "react-icons/bi";
import { BsFillFileEarmarkCodeFill } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

const treeClassname = "tree";

export type Code = {
  id: string;
  name: string;
  text: string;
  extension: string;
  type?: string;
  children?: TreeNode[];
};

export type Directory = {
  id: string;
  name: string;
  directories?: Directory[];
  codes?: Code[];
  type?: string;
  children?: TreeNode[];
  isClosed?: boolean;
};

export type TreeNode = Directory | Code;

type Props = {
  data: Directory;
  onClickFile: (file: Code | null) => void;
  onClickDirectory: (id: string | null) => void;
  onCreate: ({
    parentId,
    index,
    type,
    parentNode,
  }: {
    parentId: string | null;
    index: number;
    type: string;
    parentNode: NodeApi<Code | Directory> | null;
  }) => IdObj | Promise<IdObj | null> | null;
  onDelete: ({
    ids,
    nodes,
  }: {
    ids: string[];
    nodes: NodeApi<Code | Directory>[];
  }) => void;
  onRename: ({
    id,
    name,
    node,
  }: {
    id: string;
    name: string;
    node: NodeApi<Code | Directory>;
  }) => void;
};

export default function TreeView({
  data,
  onClickFile,
  onClickDirectory,
  onCreate,
  onDelete,

  onRename,
}: Props) {
  console.log(data);
  return (
    <div className="flex flex-col">
      <h2>{data.name}</h2>
      <Tree
        data={data.children}
        onCreate={onCreate}
        onDelete={onDelete}
        onRename={onRename}
        className={treeClassname}
        onClick={(e) => {
          if ((e.target as HTMLElement).classList.contains(treeClassname)) {
            onClickDirectory(null);
          }
        }}
      >
        {(props) => (
          <Node
            {...props}
            node={props.node}
            onClickFile={onClickFile}
            onClickDirectory={onClickDirectory}
          />
        )}
      </Tree>
    </div>
  );
}

type AdditionalNodeProps = {
  onClickFile: (file: Code | null) => void;
  onClickDirectory: (id: string | null) => void;
};

function Node({
  node,
  tree,
  style,
  dragHandle,
  onClickFile,
  onClickDirectory,
}: NodeRendererProps<Code | Directory> & AdditionalNodeProps) {
  /* This node instance can do many things. See the API reference. */
  return (
    <div
      tabIndex={0}
      style={style}
      ref={dragHandle}
      onClick={() => {
        node.data.type === "directory" && node.toggle();
        if (node.data.type === "file") {
          onClickFile(node.data as Code);
          onClickDirectory(null);
        }
        if (node.data.type === "directory") {
          onClickDirectory(node.data.id);
        }
      }}
      className={`cursor-pointer hover:bg-slate-200 ${
        node.state.isSelected
          ? "border border-blue-600 bg-slate-100 font-bold"
          : ""
      }`}
    >
      <div className="flex items-center">
        {node.data.type === "file" ? (
          <BsFillFileEarmarkCodeFill />
        ) : (
          <AiOutlineFolder />
        )}{" "}
        {node.isEditing ? (
          <input
            type="text"
            defaultValue={node.data.name}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={() => node.reset()}
            onKeyDown={(e) => {
              if (e.key === "Escape") node.reset();
              if (e.key === "Enter") node.submit(e.currentTarget.value);
            }}
            autoFocus
          />
        ) : (
          <h3>{node.data.name}</h3>
        )}
        {node.data.type !== "file" && node.isClosed ? (
          <BiSolidRightArrow />
        ) : node.data.type !== "file" && !node.isClosed ? (
          <BiSolidDownArrow />
        ) : (
          ""
        )}
        <div className="folderFileActions">
          <button onClick={() => node.edit()} title="Rename...">
            <MdEdit />
          </button>
          <button onClick={() => tree.delete(node.id)} title="Delete">
            <RxCross2 />
          </button>
        </div>
      </div>
    </div>
  );
}
