import { collection, query, where, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Item } from '../types';

export interface AdvancedSearchFilters {
  searchTerm?: string;     // Item name or keyword
  category?: string;       // Category
  location?: string;       // Location
  building?: string;       // Building
  color?: string;          // Color
  brand?: string;          // Brand
  date?: string;           // Date (YYYY-MM-DD)
  status?: string;         // Status ('active', 'claimed', 'pending', 'resolved', 'all')
  type?: string;           // Type ('all', 'lost', 'found')
}

/**
 * Perform advanced search using Firestore queries with multiple filter constraints
 */
export async function queryItemsFromFirestore(filters: AdvancedSearchFilters): Promise<Item[]> {
  try {
    const constraints: QueryConstraint[] = [];

    // Category filter
    if (filters.category && filters.category.trim() !== '') {
      constraints.push(where('category', '==', filters.category.trim()));
    }

    // Location filter
    if (filters.location && filters.location.trim() !== '') {
      constraints.push(where('location', '==', filters.location.trim()));
    }

    // Item type filter ('lost' or 'found')
    if (filters.type && filters.type !== 'all') {
      constraints.push(where('type', '==', filters.type));
    }

    // Item status filter ('active', 'claimed', 'resolved', 'pending')
    if (filters.status && filters.status !== 'all' && filters.status.trim() !== '') {
      constraints.push(where('status', '==', filters.status.trim()));
    }

    // Date filter (YYYY-MM-DD)
    if (filters.date && filters.date.trim() !== '') {
      constraints.push(where('date', '==', filters.date.trim()));
    }

    const itemsRef = collection(db, 'items');
    const q = query(itemsRef, ...constraints);
    const snapshot = await getDocs(q);

    let results: Item[] = snapshot.docs.map(doc => doc.data() as Item);

    // Building filter
    if (filters.building && filters.building.trim() !== '') {
      const bLower = filters.building.trim().toLowerCase();
      results = results.filter(item => {
        const itemB = (item.building || '').toLowerCase();
        const itemL = (item.location || '').toLowerCase();
        return itemB.includes(bLower) || itemL.includes(bLower);
      });
    }

    // Color filter
    if (filters.color && filters.color.trim() !== '') {
      const cLower = filters.color.trim().toLowerCase();
      results = results.filter(item => {
        const itemColor = (item.color || '').toLowerCase();
        const itemDesc = (item.description || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();
        const itemTags = (item.tags || []).join(' ').toLowerCase();
        return itemColor.includes(cLower) || itemDesc.includes(cLower) || itemTitle.includes(cLower) || itemTags.includes(cLower);
      });
    }

    // Brand filter
    if (filters.brand && filters.brand.trim() !== '') {
      const brLower = filters.brand.trim().toLowerCase();
      results = results.filter(item => {
        const itemBrand = (item.brand || '').toLowerCase();
        const itemDesc = (item.description || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();
        const itemTags = (item.tags || []).join(' ').toLowerCase();
        return itemBrand.includes(brLower) || itemDesc.includes(brLower) || itemTitle.includes(brLower) || itemTags.includes(brLower);
      });
    }

    // Item name / keyword text filter
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const qLower = filters.searchTerm.trim().toLowerCase();
      results = results.filter(item => {
        const titleMatch = item.title ? item.title.toLowerCase().includes(qLower) : false;
        const descMatch = item.description ? item.description.toLowerCase().includes(qLower) : false;
        const locMatch = item.location ? item.location.toLowerCase().includes(qLower) : false;
        const buildingMatch = item.building ? item.building.toLowerCase().includes(qLower) : false;
        const colorMatch = item.color ? item.color.toLowerCase().includes(qLower) : false;
        const brandMatch = item.brand ? item.brand.toLowerCase().includes(qLower) : false;
        const tagMatch = item.tags ? item.tags.some(t => t.toLowerCase().includes(qLower)) : false;
        return titleMatch || descMatch || locMatch || buildingMatch || colorMatch || brandMatch || tagMatch;
      });
    }

    return results;
  } catch (error) {
    console.error('Error executing Firestore query:', error);
    return [];
  }
}
