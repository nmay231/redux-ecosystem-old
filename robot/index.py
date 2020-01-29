import os
import sqlite3
import json
import re

from datetime import date
from pathlib import Path
from typing import List, Iterator, Iterable, Union, Tuple
from dataclasses import dataclass

import requests
from mistune import markdown as markdown__to_html
from bs4 import BeautifulSoup as parse_html
from slugify import slugify


@dataclass
class Project:
    name: str = None
    urls: List[str] = None
    desc: str = None


@dataclass
class SubCategory:
    name: str = None
    slug: str = None
    projects: List[Project] = None


@dataclass
class Category:
    name: str = None
    slug: str = None
    subcats: List[SubCategory] = None


def get_github_url(urls: List[str]) -> Tuple[Union[None, str], List[str]]:
    github_pattern = re.compile("https?:\/\/(www\.|gist\.)?github.com\/[^\s]+\/[^\s]+$")
    for i, url in enumerate(urls):
        match = github_pattern.match(url)
        if match:
            return match.string, urls[:i] + urls[i + 1 :]
    return None, urls


def iter_categories(links_dir: str, blacklist_files: List[str]) -> Iterator[Category]:
    for category in os.listdir(links_dir):
        if category in blacklist_files:
            continue

        with open(Path(links_dir, category), "r") as f:
            markdown = markdown__to_html(f.read())
            html_content = parse_html(markdown, "html.parser")

        current_catg = None
        current_sub = None
        for child in html_content.children:
            if child.name == "h3":
                if current_catg is not None:
                    print("Main category already found!")
                    print(f"skipping {category}")
                    print(current_catg)
                    break

                current_catg = Category(child.string, slugify(child.string), [])

            if child.name == "h4":
                if current_catg is None:
                    print("Main category not found!")
                    print(f"skipping {category}")
                    break

                current_sub = SubCategory(
                    child.string, current_catg.slug + "/" + slugify(child.string), []
                )
                current_catg.subcats.append(current_sub)

            if child.name == "ul":
                if current_sub is None and len(html_content.select("h4")) > 0:
                    # Ignore links at the beginning of the page
                    continue

                elif current_sub is None:
                    # There are no subcategories, continue without adding one
                    current_sub = SubCategory(None, None, [])
                    current_catg.subcats.append(current_sub)

                projects = current_sub.projects
                for proj in child.children:
                    if proj.name == "li":
                        try:
                            name = proj.select("p strong")[0].string
                        except IndexError:
                            # This is a list of links and not a project, skipping
                            break
                        urls = [u["href"] for u in proj.select("a")]
                        with_breaks = proj.text.split("\n")

                        if not with_breaks[-1].strip():
                            description = with_breaks[-2].strip()
                        else:
                            description = with_breaks[-1].strip()

                        projects.append(Project(name, urls, description))

        yield current_catg


def write_to_file(final_categories: Iterable[Category], file_name: str) -> None:

    json_format = []
    for cat in final_categories:
        sub_list = []
        for sub in cat.subcats:
            proj_list = []
            for proj in sub.projects:
                github, alt_urls = get_github_url(proj.urls)
                proj_list.append(
                    {
                        "name": proj.name,
                        "github_url": github,
                        "alt_urls": alt_urls,
                        "description": proj.desc,
                    }
                )
            sub_list.append(
                {"name": sub.name, "slug": sub.slug, "repositories": proj_list,}
            )
        json_format.append(
            {"name": cat.name, "slug": cat.slug, "subcategories": sub_list,}
        )

    with open(file_name, "w") as f:
        json.dump({"categories": json_format, "last_updated": str(date.today())}, f)


if __name__ == "__main__":

    links_dir = str(Path(os.getcwd(), "links").resolve())
    destination_file = str(Path(os.getcwd(), "..", "database.json").resolve())
    blacklist_files = [".git", ".github", "README.md"]

    if not os.path.exists(links_dir) or not os.path.isdir(links_dir):
        print(f"\npath: {links_dir} does not exist or is not a directory")
        print(
            "Please run: `git clone git@github.com:markerikson/redux-ecosystem-links.git links`"
            " in the robots/ directory\n"
        )
        exit(1)
    else:
        git_dir = os.path.join(links_dir, ".git")
        print("Found Git repo of redux-ecosystem-links. Displaying latest log...")
        os.system(f"git --git-dir={git_dir} log --oneline -n 1")

    write_to_file(iter_categories(links_dir, blacklist_files), destination_file)
    print(f"Finished writing to {destination_file}")
    print("Now run `node getDownloadInfo.js`")
