## [Same-Origin Policy for Agentic Browsers](https://arxiv.org/abs/2606.14027)

This is the official repository of the following paper:
> [**Same-Origin Policy for Agentic Browsers**](https://arxiv.org/abs/2606.14027) <br>
> [Xilong Wang](https://billchan226.github.io/)<sup>1</sup>,
> Xiaoxing Chen<sup>1</sup>,
> Patrick Li <sup>2</sup>,
> [Dawn Song](https://dawnsong.io/) <sup>3</sup>,
> [Neil Gong](https://people.duke.edu/~zg70/)<sup>1</sup>
>
> <sup>1</sup>Duke University, <sup>2</sup>Stanford University, <sup>3</sup>UC Berkeley

This repository contains official implementation of **BrowserOS-SOPGuard** and supplementary artifacts for our paper, including system prompts used to construct the synthetic webpages, system prompts used for task generation, and example screenshots of synthetic webpages.

## Launching BrowserOS-SOPGuard

BrowserOS-SOPGuard follows the same launch process as BrowserOS.

For setup, build, and launch instructions, please refer to the [official BrowserOS repository](https://github.com/browseros-ai/BrowserOS). BrowserOS-SOPGuard is built on commit [`d653883e99b31974fc4e95681f1a0bbcb5176d73`](https://github.com/browseros-ai/BrowserOS/commit/d653883e99b31974fc4e95681f1a0bbcb5176d73) of BrowserOS.

## Supplementary Materials

The supplementary materials are organized under [`supplementary_materials/`](supplementary_materials/):

- [`webpage_screenshot/`](supplementary_materials/webpage_screenshot/) contains example screenshots of the synthetic webpages.
- [`sys_prompt_synthetic_webpages/`](supplementary_materials/sys_prompt_synthetic_webpages/) contains the system prompts used to construct the synthetic webpages.
- [`sys_prompt_task_generation/`](supplementary_materials/sys_prompt_task_generation/) contains the system prompts used for task generation.


## Repository Structure

```text
.
├── packages/                  # BrowserOS-SOPGuard implementation 
├── supplementary_materials/    # Supplementary prompts and webpage artifacts
└── README.md
```

## Citation
If you find this work useful, please kindly cite:

```
@article{wang2026same,
  title={Same-Origin Policy for Agentic Browsers},
  author={Wang, Xilong and Chen, Xiaoxing and Li, Patrick and Song, Dawn and Gong, Neil},
  journal={arXiv preprint arXiv:2606.14027},
  year={2026}
}
```
