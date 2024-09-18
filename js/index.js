"use strict";

let jobs = [];

const jobsContainer = document.querySelector(".jobs");
const filterBoxContainer = document.querySelector(".header__filter-box");
const filtersContainer = document.querySelector(".header__filters");

function getData(url) {
	return new Promise((res, rej) => {
		fetch(url)
			.then((res) => res.json())
			.then((data) => res(data));
	});
}

function renderHTML(parentEl, HTML, position, clean = false) {
	clean ? (parentEl.innerHTML = "") : "";
	return parentEl.insertAdjacentHTML(position, HTML);
}

function joinTemplate(arr, templateFn, join = false) {
	const newArr = arr.map((obj) => templateFn(obj));
	if (join) return newArr.join("");
	return newArr;
}

function createFilterTemplate(data) {
	return `<p class="job__filter" data-filter="${data}">${data}</p>`;
}

function createJobTemplate(data) {
	return `
			<div class="job ${data.featured ? "isFeatured" : ""}" id="${data.id}">
				<div class="job__info-box">
					<div class="job__logo">
						<img src="${data.logo}" alt="logo of the company photosnap" />
					</div>

					<div class="job__info">
						<div class="job__header">
							<h3 class="job__company-name">${data.company}</h3>
							<div class="job__tags">
								${data.new ? `<p class="job__tag job__tag--new">new!</p>` : ""}
								${data.featured ? `<p class="job__tag job__tag--featured">featured!</p>` : ""}
							</div>
						</div>
						<p class="job__name">${data.position}</p>
						<div class="job__specifications">
							<p class="job__created">${data.postedAt}</p>
							<p>*</p>
							<p class="job__time">${data.contract}</p>
							<p>*</p>
							<p class="job__location">${data.location}</p>
						</div>
					</div>
				</div>

				<div class="job__filters">
					${createFilterTemplate(data.role)}
					${createFilterTemplate(data.level)}
					${data.languages.length ? joinTemplate(data.languages, createFilterTemplate, true) : ""}
					${data.tools.length ? joinTemplate(data.tools, createFilterTemplate, true) : ""}
				</div>
			</div>
	`;
}

function createChosenFiltersTempalate(name) {
	return `
			<div class="header__filter">
				<span class="header__text " data-filter="${name}">${name}</span>
				<div class="header__icon-box">
					<img class="remove-icon" src="images/icon-remove.svg" alt="Image of the remove icon" />
				</div>
			</div>
	`;
}

getData("data.json").then((data) => {
	jobs = data;

	return renderHTML(jobsContainer, joinTemplate(jobs, createJobTemplate, true), "afterbegin");
});

let tagList = [];
let filteredJobs = [];

function filterJobs(jobs, tags) {
	const newJobArr = jobs.filter((job) => {
		const jobTags = [job.role, job.level, ...job.languages, ...job.tools];
		return tags.every((tag) => jobTags.includes(tag));
	});

	return newJobArr;
}

function handleFiltering(filterValue) {
	if (tagList.includes(filterValue)) return;
	tagList.push(filterValue);
	filteredJobs = filterJobs(jobs, tagList);

	filterBoxContainer.classList.remove("content--hidden");
	renderHTML(filtersContainer, createChosenFiltersTempalate(filterValue), "beforeend");
	return renderHTML(jobsContainer, joinTemplate(filteredJobs, createJobTemplate, true), "afterbegin", true);
}

// function removeTag(tags, removedTag) {
// 	const newTags = [...tags]; // Create a copy of the array to avoid modifying the original

// 	for (let i = 0; i < newTags.length; i++) {
// 		if (newTags[i] == removedTag) {
// 			newTags.splice(i, 1); // Remove the tag
// 			i--; // Decrement i to ensure the next element is checked correctly
// 		}
// 	}

// 	return newTags;
// }

function handleRemovingTag(tagName) {
	if (!tagName) return;

	tagList = tagList.filter((tag) => tag !== tagName);
	filteredJobs = filterJobs(jobs, tagList);
	if (!tagList.length) filterBoxContainer.classList.add("content--hidden");

	renderHTML(filtersContainer, joinTemplate(tagList, createChosenFiltersTempalate, true), "beforeend", true);
	return renderHTML(jobsContainer, joinTemplate(filteredJobs, createJobTemplate, true), "afterbegin", true);
}

document.body.addEventListener("click", (e) => {
	const { target } = e;

	if (target.matches(".job__filter")) {
		const {
			dataset: { filter },
		} = target;
		return handleFiltering(filter);
	}

	if (target.matches(".remove-icon")) {
		const tagName = target.parentElement.parentElement.querySelector(".header__text").textContent.trim();
		return handleRemovingTag(tagName);
	}

	if (target.matches(".btn-clear")) {
		tagList = [];

		filtersContainer.innerHTML = "";
		filterBoxContainer.classList.add("content--hidden");

		return renderHTML(jobsContainer, joinTemplate(jobs, createJobTemplate, true), "afterbegin", true);
	}
});
