/** @format */

import React, { Component, Fragment } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import { FaArrowDown } from 'react-icons/fa'
import SubCategoryItem from './SubCategoryItem'

class Category extends Component {
    constructor() {
        super()
        this.state = { open: false }
    }

    checkIfActive = () => {
        const { slug, category } = Router.query

        const slugInCategory = this.props.category.slug == category
        const slugInSubcategory = this.props.category.subcategories.map(
            (cat) => cat.slug && cat.slug.indexOf(slug) > -1,
        )

        if (slugInCategory || slugInSubcategory.indexOf(true) == 0) {
            this.setState({ open: true })
        }
    }

    componentDidMount() {
        this.checkIfActive()
    }

    render() {
        const { category } = this.props
        const { open } = this.state

        return (
            <Fragment>
                <li
                    onClick={() =>
                        this.setState({
                            open: !open,
                        })
                    }
                >
                    {category.name}
                </li>
                {open ? (
                    <div>
                        <Link as={`/${category.slug}`} href={`/topic?category=${category.slug}`}>
                            <a>All</a>
                        </Link>
                        {category.subcategories.map((subcategory) => (
                            <SubCategoryItem
                                key={category.name}
                                category={category}
                                subcategory={subcategory}
                                repoCount={subcategory.repositories.length}
                            />
                        ))}
                    </div>
                ) : null}
                <style jsx>{`
                    li {
                        font-size: 0.9rem;
                        padding: 3px 0;
                        cursor: pointer;
                        list-style: none;
                        margin-left: 1rem;
                    }

                    a {
                        margin-left: 1.4rem;
                        text-decoration: none;
                        color: var(--redux);
                        font-size: 0.8rem;
                    }

                    div {
                        margin-top: 0px;
                        -webkit-animation-name: list-enter;
                        -webkit-animation-duration: 0.3s;
                        animation-name: list-enter;
                        animation-duration: 0.3s;
                    }

                    @-webkit-keyframes list-enter {
                        0% {
                            height: 0;
                        }
                        25% {
                            height: 25%;
                        }
                        50% {
                            height: 75%;
                        }
                        75% {
                            opacity: 0.9;
                        }
                    }

                    @keyframes list-enter {
                        0% {
                            height: 0;
                        }
                        25% {
                            height: 25%;
                        }
                        50% {
                            height: 75%;
                        }
                        75% {
                            height: 95%;
                        }
                    }
                `}</style>
            </Fragment>
        )
    }
}
export default Category
