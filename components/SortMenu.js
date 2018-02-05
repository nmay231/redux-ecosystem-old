import React from "react"
import Link from "next/link"

import FaArrowUp from "react-icons/lib/fa/arrow-up"
import FaArrowDown from "react-icons/lib/fa/arrow-down"
import FaStar from "react-icons/lib/fa/star"
import FaDownload from "react-icons/lib/fa/download"

const SubTopicMenu = ({ topics }) => (
  <div>
    <span className="header"> Go To Subtopic</span>
    <ul>
      {topics.map(topic => (
        <li>
          <a href={`#${topic}`} key={topic}>
            {topic}
          </a>
        </li>
      ))}
    </ul>
    <style jsx>{`
      div {
        flex: 2;
        padding: 15px;
      }

      a {
        text-decoration: none;
        color: var(--redux);
        font-size: 0.8rem;
      }

      header {
        font-size: 1rem;
      }

      ul {
        margin: 0;
        padding: 0;
        list-style: none;
      }
    `}</style>
  </div>
)

const SortMenu = ({ topics }) => (
  <div className="sortNav">
    <ul>
      <div className="header">Sort By</div>
      <li>
        <label>
          <input type="checkbox" />
          NPM
        </label>
        <div className="icon">
          <FaDownload />
        </div>
      </li>
      <li>
        <label>
          <input type="checkbox" />
          GitHub
        </label>
        <div className="icon">
          <FaStar />
        </div>
      </li>
    </ul>
    {topics ? <SubTopicMenu topics={topics} /> : null}
    <style jsx>{`
      .sortNav {
        grid-row: 2;
        grid-column: col-start / span 2;
        font-size: 1.2rem;
        font-weight: 300;
        top: 25px;
        position: -webkit-sticky;
        position: sticky;
        box-sizing: border-box;
        height: 35vh;

        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      input[type="checkbox"] {
        border: solid;
        border-radius: 4px;
        border-color: var(--redux);

        width: 15px;
        height: 15px;
      }

      li {
        padding: 5px 0px;
        display: flex;
        align-items: flex-start;
        margin: 3px 0;
      }

      .icon {
        margin-left: auto;
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 15px;
        flex: 3;
        width: 80%;
      }
    `}</style>
  </div>
)

export default SortMenu
