import fetch from "isomorphic-unfetch"

import Section from "../components/Section"
import Layout from "../components/Layout.js"
import Card from "../components/Card.js"

const Topic = ({ categories }) => (
  <Layout header={categories.name}>
    {categories.subcategories.map(repository => (
      <Section key={repository.name} resource={repository} />
    ))}
  </Layout>
)

Topic.getInitialProps = async function(context) {
  const { category } = context.query
  if (!category) {
    await fetch(`http://localhost:3000/api/topics`)
    
    const categories = await res.json()

  return { categories }
  }
  const res = await fetch(`http://localhost:3000/api/${category}`)

  const categories = await res.json()

  return { categories }
}

export default Topic
