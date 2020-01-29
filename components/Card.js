/** @format */

import React, { Fragment } from 'react'
import Link from 'next/link'
import { FaGithub, FaStar, FaDownload } from 'react-icons/fa'
import { formatDescription } from './Utils/utils'

const formatDate = (date) => {
    const formattedDate = date.split('T')
    return formattedDate[0]
}

const NpmComponent = ({ downloads }) => {
    return (
        <Fragment>
            <FaDownload color={'#4183c4'} size={15} />
            <span> {downloads.toLocaleString()} </span>
            <style jsx>{`
                span {
                    margin-left: 2px;
                    font-size: 0.9rem;
                }
            `}</style>
        </Fragment>
    )
}

const GitHubStars = ({ stars }) => {
    return (
        <Fragment>
            <FaStar color={'#4183c4'} size={15} />
            <span> {stars.toLocaleString()} </span>
            <style jsx>{`
                span {
                    margin-left: 2px;
                    font-size: 0.9rem;
                }
            `}</style>
        </Fragment>
    )
}

const GitHubDate = ({ date }) => {
    return (
        <Fragment>
            Updated: <span> {date}</span>
            <style jsx>{`
                span {
                    color: black;
                    margin-left: 2px;
                    font-size: 0.9rem;
                }
            `}</style>
        </Fragment>
    )
}

const Card = ({ repo }) => {
    const downloads = repo.npm_download_since_last_month && (
        <NpmComponent downloads={repo.npm_download_since_last_month} />
    )

    const stars = repo.github_star > 2 && <GitHubStars stars={repo.github_star} />

    const githubDate = repo.github_last_update && <GitHubDate date={repo.github_last_update} />

    return (
        <div className="card-wrapper">
            <a target="blank" href={repo.github_url}>
                <div className="card-header">{repo.name}</div>
                <div className="line-seperator" />
                <div className="card-description">
                    {repo.description ? formatDescription(repo.description) : ''}
                </div>
                <div className="card-date">{githubDate}</div>
                <div className="card-stats">
                    {stars}
                    {downloads}
                </div>
            </a>
            <style jsx>{`
                .card-wrapper {
                    background: #fff;
                    box-shadow: 0 1px 2px rgba(10, 10, 10, 0.1);
                    transition: box-shadow 0.5s, border-color 0.25s ease-in-out;
                    position: relative;
                    cursor: pointer;
                    padding: 0.4rem;
                }

                .card-wrapper:hover {
                    outline: none;
                    -webkit-box-shadow: 0 0 5px #cacaca;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
                    -webkit-transition: -webkit-box-shadow 0.5s, ease-in-out;
                    transition: box-shadow 0.5s, ease-in-out;
                }

                a {
                    text-decoration: none;
                    color: currentcolor;
                }

                .card-header {
                    padding: 10px 0 5px 10px;
                    font-size: 1.2rem;
                    font-weight: 100;
                }

                .line-seperator {
                    margin: 2px 0 5px 10px;
                    background-color: var(--redux);
                    height: 1px;
                    width: 45%;
                }

                .card-description {
                    font-size: 1rem;
                    line-height: 1.5;
                    color: #5e5e5e;
                    font-weight: 300;
                    font-style: italic;
                    padding: 0 10px;
                }

                .card-stats {
                    position: absolute;
                    font-weight: 100;
                    padding: 0 10px 10px 0;
                    bottom: 0;
                    right: 0;
                }

                .card-date {
                    position: absolute;
                    color: var(--redux);
                    padding: 10px 17px;
                    font-size: 0.9rem;
                    font-weight: 100;
                    bottom: 0;
                    left: 0;
                }

                .card-date span {
                    color: black;
                }
            `}</style>
        </div>
    )
}

export default Card
