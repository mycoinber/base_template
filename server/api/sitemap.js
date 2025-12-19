export default defineEventHandler(async (event) => {
  try {
    const response = await fetch(
      `https://api.pbnmaster.online/sites/sitemap?siteId=67dff14b046e62b3966676dd`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sitemap:", error);
    return [];
  }
});
