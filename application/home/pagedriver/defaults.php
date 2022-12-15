<?php
// +----------------------------------------------------------------------
// | Author: yangxing <404133748@qq.com>
// +----------------------------------------------------------------------

namespace app\home\pagedriver;

use think\Paginator;

class defaults extends Paginator
{

    /**
     * 第一页按钮
     * @param string $text
     * @return string
     */
    protected function getFirstButton($text = "<<")
    {

        if ($this->currentPage() <= 1) {
            return null;
        }

        $url = $this->url(1
        );

        return $this->getPageLinkWrapper($url, $text);
    }

    /**
     * 上一页按钮
     * @param string $text
     * @return string
     */
    protected function getPreviousButton($text = "<")
    {

        if ($this->currentPage() <= 1) {
            return null;
        }

        $url = $this->url(
            $this->currentPage() - 1
        );

        return $this->getPageLinkWrapper($url, $text);
    }

    /**
     * 下一页按钮
     * @param string $text
     * @return string
     */
    protected function getNextButton($text = '>')
    {
        if (!$this->hasMore) {
            return null;
        }

        $url = $this->url($this->currentPage() + 1);

        return $this->getPageLinkWrapper($url, $text);
    }

    /**
     * 末页按钮
     * @param string $text
     * @return string
     */
    protected function getLastButton($text = '>>')
    {
        if (!$this->hasMore) {
            return null;
        }

        $url = $this->url($this->lastPage());

        return $this->getPageLinkWrapper($url, $text);
    }

    /**
     * 页码按钮
     * @return string
     */
    protected function getLinks()
    {
        if ($this->simple)
            return '';

        $block = [
            'first'  => null,
            'slider' => null,
            'last'   => null
        ];

        $side   = 3;
        $window = $side * 2;

        if ($this->lastPage < $window + 6) {
            $block['first'] = $this->getUrlRange(1, $this->lastPage);
        } elseif ($this->currentPage <= $window) {
            $block['first'] = $this->getUrlRange(1, $window + 2);
            $block['last']  = $this->getUrlRange($this->lastPage - 1, $this->lastPage);
        } elseif ($this->currentPage > ($this->lastPage - $window)) {
            $block['first'] = $this->getUrlRange(1, 2);
            $block['last']  = $this->getUrlRange($this->lastPage - ($window + 2), $this->lastPage);
        } else {
            $block['first']  = $this->getUrlRange(1, 2);
            $block['slider'] = $this->getUrlRange($this->currentPage - $side, $this->currentPage + $side);
            $block['last']   = $this->getUrlRange($this->lastPage - 1, $this->lastPage);
        }

        $html = '';

        /*if (is_array($block['first'])) {
            $html .= $this->getUrlLinks($block['first']);
        }

        if (is_array($block['slider'])) {
            $html .= $this->getDots();
            $html .= $this->getUrlLinks($block['slider']);
        }*/

        $html .="<select style=\"
    width: 3rem;
\" onchange='loadPage(this.value);' id='z'>";
        for ($page = 1; $page <= $this->lastPage; $page++) {
            $html .= sprintf(
                '<option value="%s" %s>%s</div>',
                $this->url($page),($this->currentPage== $page?"selected":""),$page);
        }
        $html .= sprintf("</select> <a class='tiaozhuan' href='javaScript:gotoPage();'>GO</a>");

       /* if (is_array($block['last'])) {
            $html .= $this->getDots();
            $html .= $this->getUrlLinks($block['last']);
        }*/

        return $html;
    }

    /**
     * 渲染分页html
     * @return mixed
     */
    public function render()
    {
        if ($this->hasPages()) {
            if ($this->simple) {
                return sprintf(
                    '<div class="ui buttons blue">%s %s</div>',
                    $this->getPreviousButton(),
                    $this->getNextButton()
                );
            } else {
                return sprintf(
                   '<div class="ui icon buttons blue">%s %s %s %s %s</div>',
                    $this->getFirstButton(),
                    $this->getPreviousButton(),
                    $this->getLinks(),
                    $this->getNextButton(),
                    $this->getLastButton()
                );
            }
        }
    }

    /**
     * 生成一个可点击的按钮
     *
     * @param  string $url
     * @param  int    $page
     * @return string
     */
    protected function getAvailablePageWrapper($url, $page)
    {
        return '<a class="ui button" href="' . htmlentities($url) . '">' . $page . '</a>';
    }

    /**
     * 生成一个禁用的按钮
     *
     * @param  string $text
     * @return string
     */
    protected function getDisabledTextWrapper($text)
    {
        return '<div class="ui disabled button">' . $text . '</div>';
    }

    /**
     * 生成一个激活的按钮
     *
     * @param  string $text
     * @return string
     */
    protected function getActivePageWrapper($text)
    {
        return '<div class="ui active button">' . $text . '</div>';
    }

    /**
     * 生成省略号按钮
     *
     * @return string
     */
    protected function getDots()
    {
        return $this->getDisabledTextWrapper('...');
    }

    /**
     * 批量生成页码按钮.
     *
     * @param  array $urls
     * @return string
     */
    protected function getUrlLinks(array $urls)
    {
        $html = '';

        foreach ($urls as $page => $url) {
            $html .= $this->getPageLinkWrapper($url, $page);
        }

        return $html;
    }

    /**
     * 生成普通页码按钮
     *
     * @param  string $url
     * @param  int    $page
     * @return string
     */
    protected function getPageLinkWrapper($url, $page)
    {
        if ($page == $this->currentPage()) {
            return $this->getActivePageWrapper($page);
        }

        return $this->getAvailablePageWrapper($url, $page);
    }
}
